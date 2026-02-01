const State = {
	PointsScored: 0,
	Debug: false,
	Difficulty: 0,
	TranspositionAmount: 0,
	Chord: null,
	ChordTonalDetails: {},
	ChordNotes: [],
	ChordNotesToDo: [
		/* { note: 'G', played: false, range: 'low/middle/high'} */
	],
	LastInteraction: Date.now(), // Matched note, clicks, keyboard
	Listen: true,
};

function storeSetting(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
}

function getSetting(key) {
	const item = localStorage.getItem(key);
	return item ? JSON.parse(item) : null;
}

let chord = "";
let recreate = null;
let updateTransposition = null;

const chordEl = document.getElementById("chord");
const currentChordEl = document.getElementById("currentchord");

function initializeState() {
	recreate = () => {
		// Cmaj7(#5b9#11add13sus2)
		prepareRandomChord(State.Difficulty);

		prepareStaff();

		prepareChordSummary();

		// show chord to user in the title
		chordEl.innerText = State.Chord;
		chordEl.title = State.ChordTonalDetails.name;
		console.log("Play chord: " + State.Chord);

		// Show in the debug all notes of the chord
		currentChordEl.innerText =
			State.ChordTonalDetails.name +
			" = " +
			State.ChordTonalDetails.notes.join(" ");
	};

	recreate();
}
