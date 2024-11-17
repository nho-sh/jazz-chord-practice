const currentnote = document.getElementById("currentnote");

const startMic = async () => {
	const stream = await navigator.mediaDevices.getUserMedia({
		audio: true,
	});

	const ac = new AudioContext();
	const ms = ac.createMediaStreamSource(stream);
	const analyser = ac.createAnalyser();
	analyser.fftSize = 1024 * 8;
	analyser.smoothingTimeConstant = 0.85;
	ms.connect(analyser);

	const lp = ac.createBiquadFilter(); //lowpass to cut noise
	lp.type = "lowpass";
	lp.connect(ac.destination);

	const analyserFrequencyBinCount = analyser.frequencyBinCount;

	// const tds = new Uint8Array(analyser.fftSize);
	const freqs = new Uint8Array(analyserFrequencyBinCount);

	// A mapping from the frequency bins to the matching frequency
	// (For performance reasons)
	const freqBinToFrequency = [];
	// For optimization reasons, we will once precompute the bin range
	// we care about
	let lowestBinIndex = 0;
	let highestBinIndex = analyser.frequencyBinCount;
	// Precompute the frequency of every bin
	for (let i = 0; i < analyserFrequencyBinCount; i++) {
		freqBinToFrequency[i] = (i * ac.sampleRate) / analyser.fftSize;
		// Clip lowest and highest frequencies
		if (freqBinToFrequency[i] <= 30) {
			// The frequency below 30Hz, is not made by most instruments,
			// so we can ignore it
			freqBinToFrequency[i] = -1;

			// Precompute lowest bin for perf later
			lowestBinIndex = Math.max(lowestBinIndex, i);
		}
		if (freqBinToFrequency[i] > 8000) {
			// The frequency above 4800z, is not made by most instruments,
			// so we can ignore it. But we do have to take account for at
			// least a few overtones in order to do overtone detection later
			// on.
			// A standard piano for example, goes up  to C8, which is 4186Hz.
			// Taking overtones for that, we would quickly reach the microphones
			// upper limit, and this is not a useful spot to be practicing chord
			// reading anyway.
			// As such, we can go lower, to something like a B6, then the forth
			// overtone is around 8000Hz
			freqBinToFrequency[i] = -1;

			// Precompute lowest bin for perf later
			highestBinIndex = Math.min(highestBinIndex, i);
		}
	}

	let currentNote;
	let currentNoteSince;

	const resetFrequencies = () => {
		Notes.forEach((note) => {
			note.totvolume = 0;
			note.totvolumecount = 0;
			note.volume = 0;
		});
	};

	const mapFrequencyBinsToFrequencies = () => {
		analyser.getByteFrequencyData(freqs);

		let lastNoteIndex = 0;
		for (let i = lowestBinIndex; i < highestBinIndex; i++) {
			// Calculate the frequency for the current bin
			const frequency = freqBinToFrequency[i];

			if (frequency <= 0) {
				// Was it clipped in the precompute??
				continue;
			}

			// Find the corresponding note for this frequency
			let matchingNote = null;
			for (let j = lastNoteIndex; j < Notes.length; j++) {
				const note = Notes[j];
				if (note.start <= frequency && frequency <= note.end) {
					lastNoteIndex = j; // Keep a count, so next cycle is faster
					matchingNote = note;
					break;
				}
			}

			// If a matching note is found, add the amplitude value to its total volume
			if (matchingNote) {
				matchingNote.totvolume += freqs[i];
				matchingNote.totvolumecount++;
			}
		}
	};

	const minVol = 80;

	let notesWithAnyVolume;
	let loudestNote;
	let topNotes;

	const getTopNotes = () => {
		notesWithAnyVolume = Notes
			// Find the note with the highest combined volume
			.filter((f) => {
				if (f.totvolumecount > 0) {
					// Calculate the volume
					f.volume = f.totvolume / f.totvolumecount;

					// Only keep those that have enough volume
					return f.volume > minVol;
				}
				return false;
			});

		// TODO: replace the reduce, with a top 5 sorted list
		//   each time a note is louder than any of the 5, replace it
		// with the weakest
		// This avoids the top5Notes loop
		loudestNote = notesWithAnyVolume.reduce(
			(prev, curr) => (prev.volume > curr.volume ? prev : curr),
			{ volume: 0 }
		);

		// Sort notes by volume in descending order and pick the top 5
		return (
			notesWithAnyVolume
				.filter((note) => note.totvolumecount > 0)
				// Only take notes that are also loud
				// compared to the loudest
				.filter((note) => note.volume >= loudestNote.volume * 0.3)
				.sort((a, b) => b.volume - a.volume)
				.slice(0, 10)
		);
	};

	const canvasSpectrum = document.getElementById("currentspectrum");
	const canvasSpectrumContext = canvasSpectrum.getContext("2d");
	canvasSpectrumContext.lineWidth = 2;
	const renderSpectrumAndNotes = () => {
		if (!State.Debug) {
			return;
		}
		const { width, height } = canvasSpectrum;

		canvasSpectrumContext.clearRect(0, 0, width, height);

		canvasSpectrumContext.fillStyle = "white";

		// Render notes from the active frequencies
		// The top notes are highlighted in red
		for (let i = lowestBinIndex; i < highestBinIndex; i++) {
			// Calculate the frequency for the current bin
			const frequency = freqBinToFrequency[i];

			// Find the corresponding note for this frequency
			const note = Notes.find(
				(f) => f.start <= frequency && frequency < f.end
			);
			if (!note) {
				continue;
			}

			// If a matching note is found, add the amplitude value to its total volume
			if (topNotes.includes(note)) {
				canvasSpectrumContext.fillStyle = "red";
			} else {
				canvasSpectrumContext.fillStyle = "white";
			}

			const freq = height - (note.volume / 256) * height;
			canvasSpectrumContext.fillRect(i, 0, 1, height - freq);
		}
	};

	const currentVolumeEl = document.getElementById("currentvolume");

	const resetMatchedNote = () => {
		currentNote = null;
		currentNoteSince = null;

		if (State.Debug) {
			// currentnote.innerText = "00";
		}

		updatePlayingNote(null);
	};

	let lastReset = Date.now();

	(function listen() {
		// If not listening yet, or if the window is idle
		// then do not bother rendering and consume CPU
		if (!State.Listen || isIdle(3000)) {
			setTimeout(listen, 333);
			return;
		}

		// TODO: if notes per minute is very low,
		// it is probably because its not in use,
		// in that case, pause the loop
		// and ask for user input

		requestAnimationFrame(() => {
			const now = Date.now();
			// Keep gather notes until a certain amount has been filled
			if (now - lastReset > 50) {
				lastReset = now;
				// Reset the counts, so we can calculate the volume per note again
				resetFrequencies();
			}

			mapFrequencyBinsToFrequencies();

			topNotes = getTopNotes();

			if (topNotes.length > 2) {
				// Harmonic detection
				// Of all the top 10 notes, check which of the notes
				// overtones are also in the topNotes. That note
				// is most likely the fundamental being played

				let overtoneMatches = 0;
				let bestNote = null;

				topNotes.forEach((topNote) => {
					let otMatches = 0;
					for (const overtone of topNote.overtones) {
						if (topNotes.includes(overtone)) {
							otMatches++;
						} else {
							// if a consecutive overtone does not match
							// then its not realistic this note is important
							break;
						}
					}

					if (otMatches >= overtoneMatches) {
						overtoneMatches = otMatches;
						bestNote = topNote;
					}
				});

				if (State.Debug && bestNote) {
					currentVolumeEl.innerText =
						"Volume: " + Math.round(bestNote.volume);

					// TODO: also show the #/b alternative
					currentnote.innerText = transposeNoteOfOctave(bestNote.note);
				}

				// No not found? Or almost no overtones found?
				// Not a real note
				if (!bestNote || overtoneMatches <= 1) {
					resetMatchedNote();
				}
				// Only accept note if it is been played
				// for some time
				else if (bestNote !== currentNote) {
					currentNoteSince = Date.now();
					currentNote = bestNote;
				} else if (Date.now() - currentNoteSince > 200) {
					currentNoteSince = Date.now();

					updatePlayingNote(bestNote.note);
				}
			} else {
				resetMatchedNote();
			}

			renderSpectrumAndNotes();

			listen(); // recursive call
		});
	})();
};

startMic();
