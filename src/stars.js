const canvas = document.getElementById("backgroundCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size to cover the full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function drawPixel(x, y, color) {
	ctx.save();
	ctx.fillStyle = color;
	// Draw a 1x1 rectangle at (x, y) to represent a pixel
	ctx.fillRect(x, y, 1, 1);
	ctx.restore();
}

// Function to draw multiple glowing orbs
function drawRandomStars(count) {
	for (let i = 0; i < count; i++) {
		const x = Math.random() * canvas.width;
		const y = Math.random() * canvas.height;
		drawPixel(x, y, "white");
	}
}

const redrawStars = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	drawRandomStars(State.PointsScored);
};

window.addEventListener("resize", redrawStars);

drawRandomStars(State.PointsScored);
