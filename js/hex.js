let cx, cy;
let balls = [];
let lines = [];
let hexagon = [];
let allPoints = [];
const defaultColors = {
	blue: "#2F8BF2",
	red: "#F53560"
};
const defaultPathSize = 10;
const defaultBallSize = 6;
const defaultSpeed = 0.02;
const defaultVector = 1;
const defaultCorrectionAngle = 90;
const defaultLayers = 30;
const defaultRange = 200;

class Line {
	constructor(x, y, angle) {
		this.pathSize = defaultPathSize;
		this.startX = x;
		this.startY = y;
		this.angle = angle;
		this.endX = this.startX + cos(this.angle) * this.pathSize;
		this.endY = this.startY + sin(this.angle) * this.pathSize;
	}

	display() {
		strokeWeight(1);
		stroke("#fff");
		line(this.startX, this.startY, this.endX, this.endY);
	}
}

class Ball {
	constructor(line, range) {
		this.startX = line.startX;
		this.startY = line.startY;
		this.angle = line.angle;
		this.endX = line.endX;
		this.endY = line.endY;
		this.range = range;

		this.ballRadius = defaultBallSize;
		this.ballDirectionVector = defaultVector;
		this.colorAmount = 0;
		this.colorChangeVector = defaultVector;
		this.colors = defaultColors;

		this.speed = defaultSpeed;
		this.ballPos = 0;
		this.counter = 0;
		this.sleep = 0;
	}

	display() {
		noStroke();

		let p0 = createVector(this.startX, this.startY);
		let p1 = createVector(this.endX, this.endY);

		let from = color(this.colors.blue);
		let to = color(this.colors.red);

		let colorToUse = lerpColor(from, to, this.colorAmount);
		fill(colorToUse);

		this.counter += this.speed;
		if (this.counter > this.range / 30) {
			this.ballPos += this.speed * this.ballDirectionVector;
			this.colorAmount += this.speed * this.colorChangeVector;
		}

		if (this.ballPos > 1) {
			this.ballPos = 1;
			this.changeDirection();
		}
		if (this.ballPos < 0) {
			this.ballPos = 0;
			this.changeDirection();
		}

		let p2 = p5.Vector.lerp(p0, p1, this.ballPos);

		circle(p2.x, p2.y, this.ballRadius);
	}

	changeDirection(ball) {
		this.sleep += this.speed;
		if (this.sleep > 0.5) {
			this.ballDirectionVector *= -1;
			this.colorChangeVector *= -1;
			this.sleep = 0;
		}
	}
}

function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
	cx = window.innerWidth / 2;
	cy = window.innerHeight / 2;
	angleMode(DEGREES);

	createBoundaries();
	createVectors();
	createBalls();
}

function draw() {
	background("#1f1f1f");
	drawSliders();
}

function drawSliders() {
	lines.forEach((line) => {
		line.display();
	});

	balls.forEach((ball) => {
		ball.display();
	});
}

function createBoundaries() {
	let value = 0;
	let start1 = 0;
	let stop1 = 6;
	let start2 = 0;
	let stop2 = 360;
	let range = defaultRange;

	for (let i = 0; i < stop1; i++) {
		value = i;

		let a = map(value, start1, stop1, start2, stop2);
		a -= defaultCorrectionAngle;
		let px = cx + cos(a) * range;
		let py = cy + sin(a) * range;

		hexagon.push({
			x: px,
			y: py
		});
	}
	// for debug purposes
	// strokeWeight(1);
	// stroke("#fff");
	// hexagon.forEach((point, idx) => {
	// 	let next = hexagon[idx + 1] ? hexagon[idx + 1] : hexagon[0];
	// 	line(point.x, point.y, next.x, next.y);
	// });
}

function createVectors() {
	for (let i = 0; i < defaultLayers; i++) {
		// odd numbers aritimetic progression
		let n = i === 0 ? 0 : 2 * i - 1;
		let jitterAngle = random(0, 360);

		let range = map(i, 0, defaultLayers, 0, defaultRange);

		for (let j = 0; j < n; j++) {
			let a = map(j, 0, n, 0, 360);
			a -= jitterAngle;

			let px = cx + cos(a) * range;
			let py = cy + sin(a) * range;

			let point = {
				x: px,
				y: py,
				a: a,
				r: i
			};

			if (isInside(point, hexagon)) {
				// for debug purposes
				// circle(point.x, point.y, 1);
				allPoints.push(point);
			}
		}
	}
}

function createBalls() {
	allPoints.forEach((p) => {
		let line = new Line(p.x, p.y, p.a);
		let ball = new Ball(line, p.r);
		balls.push(ball);
		lines.push(line);
	});
}

function isInside(point, poly) {
	let x = point.x,
		y = point.y;

	let inside = false;
	for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		let xi = poly[i].x;
		let yi = poly[i].y;
		let xj = poly[j].x;
		let yj = poly[j].y;

		let intersect =
			yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
		if (intersect) inside = !inside;
	}

	return inside;
}
