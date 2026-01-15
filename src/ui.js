class DifficultyButton extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
		<span id="${this.getAttribute(
			"elid"
		)}" class="toggle-button button-gray button-large"
				><span class="label">${this.getAttribute("label")}</span
			></span>`;
	}
}

customElements.define("difficulty-button", DifficultyButton);

const flipBox = document.getElementById("flip-box");
function flipUserInterface() {
	// Toggle the flipped class to apply the rotation
	flipBox.classList.toggle("flipped");

	// Only listen if the staff is visible
	State.Listen = !flipBox.classList.contains("flipped");
}

function initializeUI() {
	State.Difficulty = getSetting("difficulty") || "1";
	const prefix = "toggleDifficulty";
	const clearDifficulty = () => {
		for (let i = 1; i <= 7; i++) {
			document.getElementById(prefix + i).classList.remove("active");
		}
	};

	document.querySelectorAll(".toggle-button").forEach((button) => {
		button.addEventListener("click", () => {
			if (button.id.includes(prefix)) {
				State.Difficulty = button.id.substring(prefix.length);
				console.log("Difficulty changed to " + State.Difficulty);
				clearDifficulty();
				document.getElementById("selectSongChords").value = "";

				storeSetting("difficulty", State.Difficulty.toString());

				button.classList.toggle("active"); // Toggle active class to change button style

				// When the user picks a different difficulty level
				// we immediatly prepare a new chord
				recreate();
			}
		});
	});
	document.getElementById("selectSongChords").onchange = () => {
		clearDifficulty();
		const val = document.getElementById("selectSongChords").value;
		if (!val) {
			document.getElementById("toggleDifficulty1").dispatchEvent(
				new MouseEvent("click", {
					view: window,
					bubbles: true,
					cancelable: true,
				})
			);
		} else {
			// Set value equal to a string
			State.Difficulty = val;
			storeSetting("difficulty", State.Difficulty.toString());

			// When the user picks a song
			// we immediatly prepare a new chord from that song
			recreate();
		}
	};

	if (Number.isInteger(parseInt(State.Difficulty, 10))) {
		document
			.getElementById(prefix + State.Difficulty)
			.classList.add("active");
	} else {
		document.getElementById("selectSongChords").value = State.Difficulty;
	}

	State.TranspositionAmount = parseInt(getSetting("transposition") || "0", 10);
	updateTransposition = function updateTransposition() {
		State.TranspositionAmount = parseInt(
			document.getElementById("transposition").value,
			10
		);
		storeSetting("transposition", State.TranspositionAmount.toString());

		console.log("Transposition is " + State.TranspositionAmount);
	};
	document.getElementById("transposition").value =
		State.TranspositionAmount.toString();
	console.log("Transposition is " + State.TranspositionAmount);

	let debugChordClicks = 0;
	let debugChordClicksSince = null;

	// Clicking the chord shows a alias for that chord
	document.getElementById('chord').addEventListener('click', () => {
		const newAlias = getChordAlias(State.Chord, true);
		document.getElementById("chord").innerText = newAlias;
		document.getElementById("chord").title = newAlias;

		// Allow pressing the Chord title a few times and activate the debug view
		const now = Date.now();
		if (!debugChordClicksSince || debugChordClicksSince > now - 2*1000) {
			debugChordClicksSince = now;
			debugChordClicks += 1;

			console.log('Debug enabling: ' + debugChordClicks)
			if (debugChordClicks > 5) {
				toggleDebug();
				debugChordClicks = null;
			}
		}
		else {
			debugChordClicks = 0;
			debugChordClicksSince = null;
		}
	});

	document.addEventListener("keypress", function (event) {
		State.LastInteraction = Date.now();

		// Keyboard shortcut to start again
		// TODO: do not allow this, if displaying 'greatMsg'
		//       because it will reset 2x shortly
		if (event.key === " ") {
			recreate();
			event.preventDefault();
			return;
		}

		if (event.key === "d") {
			toggleDebug();
		}

		if (State.Debug) {
			if (["1", "2", "3", "4", "5", "6", "7"].includes(event.key)) {
				const position = parseInt(event.key, 10);
				const chordNote = State.ChordNotes[position - 1]; // Gb

				const reverseTransposedNote = Tonal.Note.transpose(
					Tonal.Note.enharmonic(
						State.ChordNotes[position - 1]
					),
					Tonal.Interval.fromSemitones(-State.TranspositionAmount)
				);

				updatePlayingNote(
					reverseTransposedNote + '2'
				);
			}
		}
	});

	// Register handlers so we know when the user has interacted
	// with the app
	[
		"click",
		"mousedown",
		"touchstart",
		// "mousemove",
		"keydown",
		"scroll",
	].forEach((event) => {
		window.addEventListener(
			event,
			() => {
				State.LastInteraction = Date.now();
			},
			{ passive: true } // do not block events from being handled elsewhere
		);
	});
}

function toggleDebug() {
	State.Debug = !State.Debug;

	const debug1 = document.getElementById("debug1");
	const debug2 = document.getElementById("debug2");
	if (State.Debug) {
		debug1.style.display = "block";
		debug2.style.display = "block";
	} else {
		debug1.style.display = "none";
		debug2.style.display = "none";
	}
}

let hiddenSince = null;
function isIdle(idleTimeMs = 30e3) {
	// document is not visible to the user, no point in rendering
	// and waste CPU, try again later
	// However, we dont immediatly freeze, but only after some time
	// of inactivity
	if (document.hidden) {
		// TODO also check for focus, but wait much longer (30min?)
		//      before taking it into account
		//      document.hidden || !document.hasFocus?.()

		if (hiddenSince && Date.now() > hiddenSince + idleTimeMs) {
			return true;
		}

		// continue or start the clock
		hiddenSince = hiddenSince || Date.now();
	} else {
		// reset
		hiddenSince = null;
	}

	return false;
}

function showHelp() {
	State.Listen = false;
	document.getElementById("help").style.visibility = "visible";
}
function closeHelp() {
	State.Listen = true;
	document.getElementById("help").style.visibility = "hidden";
}
