
function lightAtlas(size, rows) {

	this.size = size;
	this.rows = rows;
	this.texture = new GL.Texture(size, size, { format: gl.LUMINACE_ALPHA, type: gl.FLOAT });
	this.curCell = 0;
	this.delta = 1.0 / rows;
}

lightAtlas.prototype = {

	allocate : function(mesh) {
		
		var offX = (this.curCell / this.rows) | 0;
		var offY = (this.curCell % this.rows) | 0;
		this.curCell++;
		mesh.uniforms.lightmapOff = [offX*this.delta, offY*this.delta];
	}
}


function camera() {

	this.angleX = -35;
	this.angleY = -45;
	this.dist   = 4;
	this.pos = new GL.Vector(-5,5,5);
}

camera.prototype = {

	updateAngles : function(dx, dy) {
		this.angleY -= dx * 0.25;
	    this.angleX -= dy * 0.25;
	    this.angleX = Math.max(-90, Math.min(90, this.angleX));
	},

	setZoom : function(z) {
		this.dist = z;
		this.dist = this.dist < 0.0 ? 0.0 : this.dist;
	},

	updateZoom : function(dz) {
		this.setZoom(this.dist + dz);
	},

	applyTransform : function() {
		gl.rotate(-this.angleX, 1, 0, 0);
		gl.rotate(-this.angleY, 0, 1, 0);
		gl.translate(-this.pos.x, -this.pos.y, -this.pos.z);
	},

	getMatrix : function () {
		var mat = GL.Matrix.rotate(-this.angleX, 1, 0, 0);
		mat = mat.multiply(GL.Matrix.rotate(-this.angleY, 0, 1, 0));
		mat = mat.multiply(GL.Matrix.translate(-this.pos.x, -this.pos.y, -this.pos.z));
		return mat;
	},
}

var pow8 = Math.pow(2,8);
var pow16 = Math.pow(2,16);
var pow24 = Math.pow(2,24);
var pdata = new Uint8Array(4);
var strobe = 0;

function pick() {
	strobe++;
	if (strobe == 10) {
		strobe = 0;
		gl.readPixels(mouse.x, gl.drawingBufferHeight-mouse.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pdata);
		if (mouse.free)
			mouse.object = pdata[0] + pdata[1]*pow8 + pdata[2]*pow16;
	}
}

GL.Raytracer.hitTestMesh = function(origin, ray, obj) {
	var t = Number.MAX_VALUE;
	var finalHit = null;
	var verts = obj.mesh.vertices;
	var tris = obj.mesh.triangles;

	for (i in tris) {
		var tri = tris[i];
		var mat = obj.transform;
		var a = mat.transformPoint(GL.Vector.fromArray(verts[tri[0]]));
		var b = mat.transformPoint(GL.Vector.fromArray(verts[tri[1]]));
		var c = mat.transformPoint(GL.Vector.fromArray(verts[tri[2]]));
		var result = GL.Raytracer.hitTestTriangle(origin, ray, a, b, c);

		if (result != null && result.t < t) {
			finalHit = result;
			t = finalHit.t;
		} 
	}
	return finalHit;
}

GL.Vector.snap = function(vec, step) {

	if (step == 0) return vec;
	
	var rstep = 1 / step;
	var x = Math.round(vec.x * rstep) * step;
	var y = Math.round(vec.y * rstep) * step;
	var z = Math.round(vec.z * rstep) * step;

	return new GL.Vector(x, y, z);
}

function extend(gl) {

	gl.begin2D = function() {

		gl.matrixMode(gl.PROJECTION);
		gl.pushMatrix();
		gl.loadIdentity();
		gl.ortho(0, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, 10000.0, -10000.0);
		gl.matrixMode(gl.MODELVIEW);
		gl.pushMatrix();
		gl.loadIdentity();
	};

	gl.end2D = function() {
		gl.matrixMode(gl.PROJECTION);
		gl.popMatrix();
		gl.matrixMode(gl.MODELVIEW);
		gl.popMatrix();
	};

	gl.BLEND_NONE = 0
	gl.BLEND_MULT = 1;
	gl.BLEND_ADD  = 2;
	gl.BLEND_ALPHA = 3;

	gl.setBlend = function(mode) {

		switch(mode) {
			case gl.BLEND_NONE:
				gl.disable(gl.BLEND);
				break;

			case gl.BLEND_ADD:
				gl.enable(gl.BLEND);
				gl.blendFunc(gl.ONE, gl.ONE);
				break;

			case gl.BLEND_MULT:
				gl.enable(gl.BLEND);
				gl.blendFunc(gl.DST_COLOR, gl.ZERO);
				break;

			case gl.BLEND_ALPHA:
				gl.enable(gl.BLEND);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
				break;
		}
	}
}
