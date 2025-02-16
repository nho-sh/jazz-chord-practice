function transposeChordAndRandomizeNotation(chord) {
	const { tonic, aliases } = Tonal.Chord.get(chord);

	return (
		transposeNote(tonic) + aliases[Math.floor(Math.random() * aliases.length)]
	);
}

function getChordAlias(chord, forceDifferent) {
	const { tonic, aliases } = Tonal.Chord.get(chord);

	// Although there are lots of theoretical and rare used
	// notations, these are not desired in this excercise,
	// as it complicates things for the student without much value
	const allowedAliases = aliases.filter((a) => !UnusedChordAliases.includes(a));
	
	console.log(chord, aliases);

	if (allowedAliases.length === 0) {
		// No candidates
		return chord;
	}

	const differentChord = tonic + allowedAliases[Math.floor(Math.random() * allowedAliases.length)];

	if (forceDifferent && allowedAliases.length > 1 && chord === differentChord) {
		// random new one is actually the same?
		// then try again, recursively
		return getChordAlias(chord, forceDifferent);
	}

	return differentChord
}

function prepareRandomChord(difficultyOrSong) {
	const currentChord = State.Chord;

	let chordLib = ChordLib[difficultyOrSong];

	// Pick a random chord within the difficulty
	let newChord;
	do {
		newChord = chordLib[Math.floor(Math.random() * chordLib.length)];
	}
	while (newChord === currentChord);

	// only transpose if its a song
	// that way, the difficulty is not affected
	if (!Number.isInteger(parseInt(difficultyOrSong, 10))) {
		State.Chord = transposeChordAndRandomizeNotation(newChord);
	} else {
		// do not transpose, but randomize the notation
		// maj -> M -> ma
		State.Chord = getChordAlias(newChord, false);
	}

	// Working test cases
	// State.Chord = "C7b9#11";
	// State.Chord = "A-7b5";

	// State.Chord = "B#7b9#5"; // PROBLEM
	// State.Chord = "B7b9#11"; // PROBLEM: not enough room, start 1 line lower, at low B?

	// State.Chord = 'Gbm'

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
