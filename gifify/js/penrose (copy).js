// Simple way to attach js code to the canvas is by using a function
function sketchProc(processing) {
	allTrisPGraphics = new Array();
	golden = (1 + Math.sqrt(5)) / 2;
	stroke = false;

	// all triples must be specified CCW.
	function triangle(isThin, ax, ay, bx, by, cx, cy) {
		this.isThin = isThin; //otherwise it is a thick triangle
		this.ax = ax;
		this.ay = ay;
		this.bx = bx;
		this.by = by;
		this.cx = cx;
		this.cy = cy;
	}

	// for the purpose of penrose tiles:
	// the unique angle is always 36 degrees.
	// the tip always sits at the origin
	function isoscelesTriangle(degRotation, scale, flip) {
		if (flip) {
			var flipAngle = 36;
			var noFlipAngle = 0;
		} else {
			var flipAngle = 0;
			var noFlipAngle = 36;
		}

		return new triangle(
			true,
			0,
			0,
			scale * Math.cos(processing.radians(degRotation + flipAngle)),
			scale * Math.sin(processing.radians(degRotation + flipAngle)),
			scale * Math.cos(processing.radians(degRotation + noFlipAngle)),
			scale * Math.sin(processing.radians(degRotation + noFlipAngle)));
	}

	function subdivideOne(tri) {
		if (tri.isThin) {
			var px = tri.ax + (tri.bx - tri.ax) / golden;
			var py = tri.ay + (tri.by - tri.ay) / golden;

			return ([
				new triangle(true, tri.cx, tri.cy, px, py, tri.bx, tri.by),
				new triangle(false, px, py, tri.cx, tri.cy, tri.ax, tri.ay)
			]);
		} else {
			var qx = tri.bx + (tri.ax - tri.bx) / golden;
			var qy = tri.by + (tri.ay - tri.by) / golden;
			var rx = tri.bx + (tri.cx - tri.bx) / golden;
			var ry = tri.by + (tri.cy - tri.by) / golden;

			return ([
				new triangle(false, qx, qy, rx, ry, tri.bx, tri.by),
				new triangle(true, rx, ry, qx, qy, tri.ax, tri.ay),
				new triangle(false, rx, ry, tri.cx, tri.cy, tri.ax, tri.ay)
			]);
		}
	}

	function subdivideAll(tris) {
		var newTris = Array();

		for (var i = 0; i < tris.length; i++) {
			var divisions = subdivideOne(tris[i]);

			for (var j = 0; j < divisions.length; j++)
				newTris.push(divisions[j]);
		}

		return newTris;
	}

	function initTriangles() {
		var tris = Array();
		for (var i = 0; i < 5; i++)
			tris.push(new isoscelesTriangle(72 * i, cHeight / 2, false));

		for (var i = 0; i < 5; i++)
			tris.push(new isoscelesTriangle(36 + 72 * i, cHeight / 2, true));

		return tris;
	}

	function init(iterations) {
		// precompute all tilings
		var tris = subdivideAll(initTriangles());

		for (var i = 0; i < iterations; i++) {
			var pg = new processing.createGraphics(cWidth, cHeight);

			pg.translate(centerX, centerY);

			pg.beginDraw();
			pg.noStroke();

			for (var j = 0; j < tris.length; j++) {
				var currentTri = tris[j]
				if (currentTri.isThin) {
					pg.fill(0, 128, 115);
				} else {
					pg.fill(0, 94, 125);
				}
				pg.triangle(currentTri.ax,
					currentTri.ay,
					currentTri.bx,
					currentTri.by,
					currentTri.cx,
					currentTri.cy);
			}

			pg.endDraw();

			allTrisPGraphics.push(pg);
			tris = subdivideAll(tris);
		}
	}

	opac = 0;
	maxOpac = 255;
	prevFrame = 0
	currentFrame = 1;
	delay = 30;
	delayAcc = delay;
	scaleFactor = 1
	scaleGrowth = 0.03;

	processing.draw = function() {
		var numIterations = allTrisPGraphics.length;

		if (delayAcc == delay) {
			if (prevFrame != numIterations - 1) {

				processing.background(40);

				processing.tint(255, maxOpac - opac);
				processing.image(allTrisPGraphics[prevFrame], 0, 0);

				processing.tint(255, opac);
				processing.image(allTrisPGraphics[currentFrame], 0, 0);

				opac += 25;
				if (opac > 255) {
					opac = 0
					prevFrame = currentFrame;
					currentFrame = (currentFrame + 1) % (numIterations);

					delayAcc = 0
				}

			} else {
				processing.translate(centerX - scaleFactor * centerX, centerY - scaleFactor * centerY);
				processing.scale(scaleFactor);
				processing.image(allTrisPGraphics[prevFrame], 0, 0);
				console.log([scaleFactor, scaleGrowth, centerX]);
				scaleFactor += scaleGrowth;
			}
		} else {
			delayAcc += 1;
		}



	};

	processing.mouseClicked = function() {
		if (stroke)
			processing.noStroke();
		else
			processing.stroke(0);
		stroke = !stroke;
	};

	//set canvas size and call immediately
	function setup() {
		cWidth = window.innerWidth;
		cHeight = window.innerHeight;
		processing.size(cWidth, cHeight);
		processing.noStroke();
		centerX = processing.width / 2;
		centerY = processing.height / 2;
		init(7);
	}

	setup();
}

var canvas = document.getElementById('canvas1');
// attaching the sketchProc function to the canvas
var p = new Processing(canvas, sketchProc);
