
function getSize() {
	var el = document.getElementsByTagName('canvas')[0];
	return {
		height : el.height,
		width  : el.width
	};
}

function extend(gl) {

	gl.begin2D = function() {

		gl.matrixMode(gl.PROJECTION);
		gl.pushMatrix();
		gl.loadIdentity();
		gl.ortho(0, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, -1.0, 1.0);
		gl.matrixMode(gl.MODELVIEW);
		gl.pushMatrix();
		gl.loadIdentity();
	}

	gl.end2D = function() {
		gl.matrixMode(gl.PROJECTION);
		gl.popMatrix();
		gl.matrixMode(gl.MODELVIEW);
		gl.popMatrix();
	}

}