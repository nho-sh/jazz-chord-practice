const nodeMicEl = document.getElementById("noteMic");
const svgStaff = document.getElementById("staff");

// Constains a list of all added DOM SVG elements
// and they note of the chord they belong to
// This way, we can easily remove those elements
// when showing new chords
// or show those elements, when a note is played
let staffNotes = [];

function prepareStaff() {
	if (State.ChordNotes.length) {
		// x: 100(+offset)
		// y: 150(+10)
		const makeNoteEl = (overlapShift, cLineOffset = 0) => {
			const ellipseEl = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"ellipse"
			);
			const y = 149 - cLineOffset * 10;
			ellipseEl.setAttribute("class", "note");
			ellipseEl.setAttribute("cx", 103 + overlapShift * 16);
			ellipseEl.setAttribute("cy", y);
			ellipseEl.setAttribute("rx", 12);
			ellipseEl.setAttribute("ry", 8);
			ellipseEl.setAttribute("visibility", "hidden");
			ellipseEl.setAttribute(
				"transform",
				`rotate(-15 ${106 + overlapShift * 16}  ${y + 14})`
			);

			return ellipseEl;
		};
		const makeAccidentalEl = (overlapShift, cLineOffset = 0, text) => {
			const accidentalEl = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"text"
			);

			const accidental = text.replaceAll("b", "♭").replaceAll('#', "♯");

			let xCorrection = text[0] === "#" ? 0 : 0;
			let yCorrection = text[0] === "#" ? 8 : 8;

			// <text x="50" y="55" font-family="Arial" font-size="30" fill="black">Your Text Here</text>
			accidentalEl.setAttribute("class", "accidental");
			accidentalEl.setAttribute("x", xCorrection + 72 + overlapShift * 12);
			accidentalEl.setAttribute("y", yCorrection + 150 - cLineOffset * 10);
			accidentalEl.setAttribute("font-size", 25);
			accidentalEl.setAttribute("fill", "black");
			accidentalEl.setAttribute("visibility", "hidden");
			accidentalEl.textContent = accidental;

			return accidentalEl;
		};

		// remove all exiting note elements from previous cycle
		staffNotes.forEach(({ el }) => svgStaff.removeChild(el));
		staffNotes = [];

		// calculate root note and starting X
		// calculate X offset
		// calculate any overlap + set Y offset
		let prevNote = null;
		let prevLineCOffset = null;
		let prevLineAccidental = false;

		let noteOffset = 0;

		// State.ChordTonalDetails.notes = [ E Bb C# ... ]
		for (const n of State.ChordTonalDetails.notes) {
			// Calculate how many Y-axis offsets we need from the low C
			let currentNoteOffset = ConstStaffRootNotes.find(
				(rno) => rno.name === n
			).cLineOffset;

			const prevNoteOffset = prevNote
				? ConstStaffRootNotes.find((rno) => rno.name === prevNote)
						.cLineOffset
				: 0;

			// the note appears earlier than the chord root note,
			// which means we went up an octave
			noteOffset += (currentNoteOffset + 7 - prevNoteOffset) % 7;

			let overlapShift = 0;
			if (prevLineCOffset !== null && prevLineCOffset + 1 === noteOffset) {
				// 2 notes will be draw overlapping
				// so the new note, needs to be shifted slightly to the right
				overlapShift = 1;
				prevLineCOffset = null;
			} else {
				prevLineCOffset = noteOffset;
			}

			const nel = makeNoteEl(overlapShift, noteOffset);
			svgStaff.appendChild(nel);
			staffNotes.push({
				el: nel,
				note: n,
			});

			prevNote = n;

			// Accidentals

			// ♯♮♭
			if (n[1] === "b" || n[1] === "#") {
				// start gathering accidental X+Y offset
				const ael = makeAccidentalEl(
					prevLineAccidental ? -1 : 0,
					noteOffset,
					n.substring(1)
				);
				svgStaff.appendChild(ael);
				staffNotes.push({
					el: ael,
					note: n,
				});

				// if previous cycle the accidental was already shifted
				// then we can now unshift it
				prevLineAccidental = !prevLineAccidental;
			} else {
				// Reset
				prevLineAccidental = false;
			}
		}
	}
}

function initializeStaff() {
	prepareStaff();
}

let lastRenderedNote = "n/a"; // C Bb ...

/**
 * note : C Bb ...
 **/
function updatePlayingNote(inputNote) {
	if (lastRenderedNote === inputNote) {
		// Do not repaint the playing note
		// because it will trigger repaints and cost CPU/battery
		return;
	}
	lastRenderedNote = inputNote;

	if (!inputNote) {
		nodeMicEl.setAttribute("cy", 1000);
		return;
	}

	const note = transposeNoteOfOctave(inputNote);

	if (!note) {
		// transposition puts us outside the range of the calculated note frequencies
		// must be really high or low note, do not care
		return;
	}

	State.LastInteraction = Date.now();

	let cy = 1000;
	switch (note[0]) {
		case "C":
			cy = 150;
			break;
		case "D":
			cy = 140;
			break;
		case "E":
			cy = 130;
			break;
		case "F":
			cy = 120;
			break;
		case "G":
			cy = 110;
			break;
		case "A":
			cy = 100;
			break;
		case "B":
			cy = 90;
			break;
		default:
			1000; // move outside viewbox
	}

	nodeMicEl.setAttribute("cy", cy);

	const noteWithoutDegree = Tonal.Note.get(note).pc; // G#2 -> G#
	const noteName = Tonal.Note.enharmonic(noteWithoutDegree);
	const chordNoteToDo = State.ChordNotesToDo.find(
		// Use enharmonic to make comparing sane
		// by picking the most common note name
		(cn) =>
			noteName === cn.note || noteName === Tonal.Note.enharmonic(cn.note)
	);
	if (chordNoteToDo && !chordNoteToDo.played) {
		chordNoteToDo.played = true;

		console.log(
			"Played note: " +
				note +
				(note === inputNote ? "" : " (transposed from " + inputNote + ")")
		);

		const chordNoteToDoEnharmonic = Tonal.Note.enharmonic(chordNoteToDo.note);

		staffNotes.forEach((sn) => {
			if (sn.note === chordNoteToDo.note || sn.note === chordNoteToDoEnharmonic) {
				sn.el.style.visibility = "visible";
			}
		});

		State.PointsScored++;
		drawRandomStars(1);

		const unplayedCount = State.ChordNotesToDo.filter((chtd) => {
			return !chtd.played;
		}).length;
		if (unplayedCount === 0) {
			// TODO block input, and reset in a cleaner way
			document.getElementById("chord").innerText = "Great!";

			setTimeout(() => {
				prepareStaff();
				recreate();
			}, 1700);
			console.log("Finished chord " + chord);
		}
	}
}
