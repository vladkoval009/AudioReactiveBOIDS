function setup() {
	createCanvas(400, 400, WEBGL);
	var gl = document.getElementById('defaultCanvas0').getContext('webgl');
	//gl.disable(gl.DEPTH_TEST);
}

function draw() {
	background(0);
	noStroke();

	fill(255, 200, 30);
	rotateY(frameCount * 0.01);
	box(200);
	
	fill(30, 200, 255);
	rotateY(PI * 0.25);
	box(200);
}