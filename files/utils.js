
var lastReq = 0;
function loadFile(file, callback) {
	var reqID = lastReq++;
	var head = document.getElementsByTagName('head')[0];
	var s = document.createElement('script');
	var cont = undefined;
	s.src = '/file_load/id'+reqID+'/' + file;
	s.onload = function() {
		cont = window['id'+reqID];
		delete window['id'+reqID];
		if (callback != undefined) 
			callback(cont);
	}
	head.appendChild(s);
	return function() {
		return cont;
	}
}

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
	loadFile(shader+'_v.glsl', function(data){ vl = data; if (fl != undefined) s._load(vl, fl)});
	loadFile(shader+'_f.glsl', function(data){ fl = data; if (vl != undefined) s._load(vl, fl)});

	return s;
}

function intToVec(val) {
	return [(val&0xff)/256, ((val>>>8)&0xff)/256, ((val>>>16)&0xff)/256, ((val>>>24)&0xff)/256];
}

var meshID = 1;
function asyncMesh(file) {

	this.id = meshID++;
	this.mesh = gl._tmpMesh || (gl._tmpMesh = new GL.Mesh.cube({coords:true}));
	this.transform = new GL.Matrix();
	this.scale = 1;
	this.pos = [0,0,0];
	this.uniforms = {
		id : intToVec(this.id),
		transform : this.transform,
	};
	this.load(file);
}

asyncMesh.prototype = {

	tmp_mat : new GL.Matrix(),

	load : function(file) {
		var m = this;
		loadFile(file, function(data){
			m.mesh = GL.Mesh.load(data);
		});
	},

	calcTransform : function() {
		GL.Matrix.identity(this.transform);
		this.transform = this.transform.multiply(GL.Matrix.scale(this.scale, this.scale, this.scale, this.tmp_mat));
		this.transform = this.transform.multiply(GL.Matrix.translate(this.pos[0], this.pos[1], this.pos[2], this.tmp_mat));
		this.uniforms.transform = this.transform;
	},

	setPos : function(x, y, z) {
		this.pos[0] = x;
		this.pos[1] = y;
		this.pos[2] = z;
		this.calcTransform();
		return this;
	},

	setScale : function(scale) {
		this.scale = scale;
		this.calcTransform();
		return this;
	},
}

function lightAtlas(size, rows) {

	this.size = size;
	this.rows = rows;
	this.texture = new GL.Texture(size, size, { format: gl.RED, type: gl.FLOAT });
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

	draw : function(shader, uniforms, trans) {
		for (i in this.objs) {
			var obj = this.objs[i];

			if (arguments.length >= 2) {
				var unis = {};
				for (u in uniforms) 
					unis[uniforms[u]] = obj.uniforms[uniforms[u]];
				shader.uniforms(unis).draw(obj.mesh);
			} else {
				shader.draw(obj.mesh);
			}
		}
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
}

function camera() {

	this.angleX = 0;
	this.angleY = 0;
	this.dist   = 4;
}

camera.prototype = {

	updateAngles : function(dx, dy) {
		this.angleY += dx;
	    this.angleX += dy;
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
		gl.translate(0, 0, -this.dist);
		gl.rotate(this.angleX, 1, 0, 0);
		gl.rotate(this.angleY, 0, 1, 0);
	},
}

var pow8 = Math.pow(2,8);
var pow16 = Math.pow(2,16);
var pow24 = Math.pow(2,24);

function pick() {

	var p = new Uint8Array(4);
	gl.readPixels(mouse.x, mouse.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p);
	return p[0] + p[1]*pow8 + p[2]*pow16;
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
	};

	gl.end2D = function() {
		gl.matrixMode(gl.PROJECTION);
		gl.popMatrix();
		gl.matrixMode(gl.MODELVIEW);
		gl.popMatrix();
	};
}
