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

	document.addEventListener("keypress", function (event) {
		State.LastInteraction = Date.now();

		// Keyboard shortcut to start again
		// TODO: do not allow this, if displaying 'Great!'
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
			if (["C", "D", "E", "F", "G", "A", "B"].includes(event.key)) {
				updatePlayingNote(event.key);
				updatePlayingNote(event.key + "#");
				updatePlayingNote(event.key + "b");
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
