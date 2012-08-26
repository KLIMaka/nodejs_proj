
function asyncShader(shader) {

	var s = {

		shader : gl._tmpShader ||
				 (gl._tmpShader = new GL.Shader('void main(){gl_Position = vec4(0,0,0,0);}', 'void main(){gl_FragColor = vec4(0,0,0,0);}')),

		_load : function(v, f) {
			this.shader = new GL.Shader(v, f);
		},

		uniforms : function(uniforms) {
			this.shader.uniforms(uniforms);
			return this;
		},

		draw : function(mesh, mode) {
			this.shader.draw(mesh, arguments.length < 2 ? gl.TRIANGLES : mode);
			return this;
		},

		drawBuffers : function(vertexBuffers, indexBuffer, mode) {
			this.shader.drawBuffers(vertexBuffers, indexBuffer, mode);
			return this;
		},
	};

	var vl = undefined, fl = undefined;
	Cache.load('shaders/'+shader+'_v.glsl', function(data){ vl = data; if (fl != undefined) s._load(vl, fl)});
	Cache.load('shaders/'+shader+'_f.glsl', function(data){ fl = data; if (vl != undefined) s._load(vl, fl)});

	return s;
}

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

function drawer() {

	this.objs = {};
	this.bounds = { min: new GL.Vector(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE) };
	this.bounds.max = this.bounds.min.negative();
}

drawer.prototype = {

	draw : function(shader, uniforms, mode) {

		mode = mode == undefined ? gl.TRIANGLES : mode;
		for (i in this.objs) {
			var obj = this.objs[i];

			if (arguments.length == 2) {
				var unis = {};
				for (u in uniforms) 
					unis[uniforms[u]] = obj.uniforms[uniforms[u]];
				shader.uniforms(unis);
			}
			shader.draw(obj.mesh, mode);
		}
	},

	drawID : function(id, shader, uniforms, mode) {
		
		var obj = this.objs[id];
		if (obj == undefined) return;

		mode = mode == undefined ? gl.TRIANGLES : mode;
		if (uniforms != undefined)  {
			var unis = {};
			for (u in uniforms) 
				unis[uniforms[u]] = obj.uniforms[uniforms[u]];
			shader.uniforms(unis);
		}

		shader.draw(obj.mesh, mode);
	},

	add : function(obj) {
		this.objs[obj.id] = obj;
		this.recomputeBounds();
	},

	recomputeBounds : function() {

		var mms = this.bounds;
    	for (n in this.objs) {
    		var bounds = this.objs[n].mesh.getAABB();
    		mms.min = GL.Vector.min(bounds.min, mms.min);
    		mms.max = GL.Vector.max(bounds.max, mms.max);
    	}
    	mms.center = mms.min.add(mms.max).divide(2);
    	mms.radius = mms.min.add(mms.center).length();
	},

	get : function(id) {
		return this.objs[id];
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

function pick() {
	gl.readPixels(mouse.x, gl.drawingBufferHeight-mouse.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pdata);
	if (mouse.free)
		mouse.object = pdata[0] + pdata[1]*pow8 + pdata[2]*pow16;
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
		} 
	}
	return finalHit;
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
