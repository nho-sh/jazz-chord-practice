function transposeChordAndRandomizeNotation(chord) {
	const { tonic, aliases } = Tonal.Chord.get(chord);

	return (
		transposeNote(tonic) + aliases[Math.floor(Math.random() * aliases.length)]
	);
}

function prepareRandomChord(difficultyOrSong) {
	let chordLib = ChordLib[difficultyOrSong];

	const chord = chordLib[Math.floor(Math.random() * chordLib.length)];

	// only transpose if its a song
	// that way, the difficulty is not affected
	if (!Number.isInteger(parseInt(difficultyOrSong, 10))) {
		State.Chord = transposeChordAndRandomizeNotation(chord);
	} else {
		// do not transpose, but randomize the notation
		// maj -> M -> ma
		const { tonic, aliases } = Tonal.Chord.get(chord);
		State.Chord = tonic + aliases[Math.floor(Math.random() * aliases.length)];
	}

	// Working test cases
	// State.Chord = "C7b9#11";
	// State.Chord = "A-7b5";

	// State.Chord = "B#7b9#5"; // PROBLEM
	// State.Chord = "B7b9#11"; // PROBLEM: not enough room, start 1 line lower, at low B?

	State.ChordTonalDetails = Tonal.Chord.get(State.Chord);
	State.ChordNotes = State.ChordTonalDetails.notes;

	// For each note of the chord, figure out which
	// place on the staff it is going to be mapped to
	State.ChordNotesToDo = [];

	State.ChordNotes.forEach((cn) => {
		State.ChordNotesToDo.push({
			note: cn,
			played: false,
		});
	});
}
