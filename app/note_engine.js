function calculateNoteFrequencies(startNote = "C1", endNote = "B11") {
	const noteFrequencies = [];
	const A4 = 440; // Reference frequency for A4
	const A4Index = ConstAllNotes.indexOf("A") + 4 * 12; // Calculate index for A4 (starting from C0)

	let [startNoteLetter, startOctave] = startNote
		.match(/([A-G]#?)(\d)/)
		.slice(1, 3);
	let [endNoteLetter, endOctave] = endNote.match(/([A-G]#?)(\d+)/).slice(1, 3);

	let startIndex = ConstAllNotes.indexOf(startNoteLetter) + startOctave * 12; // Calculate starting index
	let endIndex = ConstAllNotes.indexOf(endNoteLetter) + endOctave * 12; // Calculate ending index

	let lastNote = { freq: 120 };

	// Iterate through each note and calculate its frequency
	for (let i = startIndex; i <= endIndex; i++) {
		let octave = Math.floor(i / 12);
		let note = ConstAllNotes[i % 12];
		let frequency = A4 * Math.pow(2, (i - A4Index) / 12); // Calculate frequency using the formula

		if (lastNote) {
			// To find the cutoff point between 2 note frequencies,
			// we cannot simply take the average, due to the 12-TET system.
			// So Sqrt(freq * freq) does the trick
			lastNote.end = Math.sqrt(lastNote.freq * frequency);
		}

		lastNote = {
			note: `${note}${octave}`,
			start: Math.sqrt(frequency * lastNote.freq),
			freq: frequency,
			end: null,
			totvolume: 0,
			totvolumecount: 0,
		};
		noteFrequencies.push(lastNote);
	}

	// For every note, calculate the first 8 overtones
	for (let i = 0; i < noteFrequencies.length; i++) {
		// Overtone series: we can simply count the same number of semitones
		// since it's always the same pattern, regardless of starting position

		// 1: 12 // 1 octave
		// 2: 19 // 1 octave and a perfect fifth
		// 3: 24 // 2 octaves
		// 4: 28 // 2 octaves and a major third
		// 5: 31 // 2 octaves and a fifth
		// 6: 34 // 2 octaves and a minor seventh
		// 7: 36 // 3 octaves
		noteFrequencies[i].overtones = [
			noteFrequencies[i + 12],
			noteFrequencies[i + 19],
			noteFrequencies[i + 24],
			noteFrequencies[i + 28],
			noteFrequencies[i + 31],
			noteFrequencies[i + 34],
			noteFrequencies[i + 36],
		].filter((n) => !!n);
	}

	return noteFrequencies;
}

const Notes = calculateNoteFrequencies();

// Input G#3 -> ...
function transposeNoteOfOctave(note) {
	const transpositionAmount = State.TranspositionAmount;

	if (transpositionAmount !== 0) {
		// Transpose the incoming perceived note,
		// to the desired display note
		const transpositionIdx =
			Notes.findIndex((f) => f.note === note) + transpositionAmount;

		if (!Notes[transpositionIdx]) {
			// transposition puts us outside the range of the calculated note frequencies
			// must be really high or low note, do not care
			return null;
		}

		return Notes[transpositionIdx].note;
	}

	// not transposed
	return note;
}

// Input C + 1 -> C#
function transposeNote(note) {
	const transpositionAmount = State.TranspositionAmount;

	if (transpositionAmount !== 0) {
		return Tonal.Note.transpose(
			note,
			Tonal.Interval.fromSemitones(State.TranspositionAmount)
		);
	}

	// not transposed
	return note;
}
