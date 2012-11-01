
Namespace('GL1.Buffers', {

	getGLType : function(constructor) {

		switch (constructor) {
			case Float32Array: return gl.FLOAT;
			case Uint16Array: return gl.UNSIGNED_SHORT;
			case Uint8Array: return gl.UNSIGNED_BYTE;
		}
	},


});

Namespace('GL1.Buffers.Preallocated', Class.extend({

	DEFAULT_TARGET     : 'ARRAY_BUFFER',
	DEFAULT_TYPE       : Float32Array,
	DEFAULT_SPACING    : 4,
	DEFAULT_NORMALIZED : false,
	DEFAULT_DRAWTYPE   : 'STATIC_DRAW',

	construct : function(length, target, type, spacing, norm, drawtype) {

		this.target = target || gl[this.DEFAULT_TARGET];
		this.type   = type || this.DEFAULT_TYPE;
		this.spacing = spacing || this.DEFAULT_SPACING,
		this.drawtype = drawtype || this.DEFAULT_DRAWTYPE;
		this.length = length;

		this.data = new this.type(this.length * this.spacing);

		this.buffer = gl.createBuffer();
		this.buffer.length = this.length;
		this.buffer.spacing = spacing;
		this.buffer.normalized = norm || this.DEFAULT_NORMALIZED;
		this.buffer.type = GL1.Buffers.getGLType(this.type);

		gl.bindBuffer(this.target, this.buffer);
		gl.bufferData(this.target, this.length*this.spacing*this.data.BYTES_PER_ELEMENT, gl[this.drawtype]);

		this.lastOff = 0;
		this.lastID = 0;
		this.updated = false;

		this.holes = {};
		this.holesCount = 0;
		var self = this;
		this.filler = function(){var arr = new Array(self.spacing); for(var i=0; i<self.spacing;i++)arr[i]=0; return arr;}();
	},

	push : function(data) {
		
		var off = 0;
		if (this.holesCount != 0) {
			var hole = keys(this.holes)[0];
			this.data.set(data, hole*this.spacing);
			delete this.holes[hole];
			this.holesCount--;
			off = hole*this.spacing;
		} else {
			this.data.set(data, this.lastOff);
			off = this.lastOff;
			this.lastOff += this.spacing;
			this.lastID++;
		}
		this.setDirt();

		return off;
	},

	getView : function(off) {
		return new this.type(this.data.buffer, this.data.BYTES_PER_ELEMENT*off, this.spacing);
	},

	pushView : function(data) {
		return this.getView(this.push(data));
	},

	remove : function(idx) {

		if (this.lastID <= idx || this.holes[idx] != undefined)
			return;

		if (idx == this.lastID - 1) {
			this.lastID--;
			this.lastOff -= this.spacing;
		} else {
			this.holes[idx] = 1;
			this.holesCount++;
		}
		this.data.set(this.filler, idx*this.spacing);

		this.setDirt();
	},

	bind : function() {
		gl.bindBuffer(this.target, this.buffer);
		if (!this.updated) {
			gl.bufferSubData(this.target, 0, this.data);
			this.updated = true;
		}
	},

	setDirt : function() {
		this.updated = false;
	},
}));

/*function StaticBuffer(target, type, length, spacing, normalized) {
	
	this.buffer = gl.createBuffer();
	this.target = target;
	this.type = type;
	this.spacing = spacing;
	this.data = new type(length*spacing);
	this.buffer.length = length;
	this.buffer.spacing = spacing;
	this.buffer.normalized = normalized;

	switch (type) {
		case Float32Array: this.buffer.type = gl.FLOAT; break;
		case Uint16Array: this.buffer.type = gl.UNSIGNED_SHORT; break;
		case Uint8Array: this.buffer.type = gl.UNSIGNED_BYTE; break;
	}

	gl.bindBuffer(this.target, this.buffer);
	gl.bufferData(this.target, length*spacing*this.data.BYTES_PER_ELEMENT, gl.STATIC_DRAW);

	this.lastOff = 0;
	this.lastID = 0;
	this.updated = false;
}

StaticBuffer.prototype =  {

	push : function(data) {
		this.data.set(data, this.lastOff);
		this.lastOff += this.spacing;
		this.lastID++;
		this.setDirt();
	},

	getView : function(idx) {
		return new this.type(this.data.buffer, this.data.BYTES_PER_ELEMENT*idx, this.spacing);
	},

	pushView : function(data) {
		var idx = this.lastOff;
		this.push(data);
		return this.getView(idx);
	},

	bind : function() {
		gl.bindBuffer(this.target, this.buffer);
		if (!this.updated) {
			gl.bufferSubData(this.target, 0, this.data);
			this.updated = true;
		}
	},

	setDirt : function() {
		this.updated = false;
	}
}
*/

function Mesh2D(options) {

	this.vertexBuffers = {};
	this.indexBuffers = {};
	this.length = options.length;

	var attrs = options.attrs;
	for (var attribute in attrs) {
		if (!attrs.hasOwnProperty(attribute)) continue;
		this.addVertexBuffer(attribute, attrs[attribute].size, attrs[attribute].type, attrs[attribute].normalized);
	}
	this.addIndexBuffer('triangles', 3);

	this.lastIdx = 0;
}

Mesh2D.prototype = {

	addVertexBuffer : function(attribute, size, type, normalized) {
		var buffer = this.vertexBuffers[attribute] = GL1.Buffers.Preallocated.create(this.length*4, gl.ARRAY_BUFFER, type, size, normalized);
	},

	addIndexBuffer : function(name, size) {
		var buffer = this.indexBuffers[name] = GL1.Buffers.Preallocated.create(this.length*2, gl.ELEMENT_ARRAY_BUFFER, Uint16Array, size);
	},

	addQuad : function(quad) {

		var res = {a:{}, b:{}, c:{}, d:{}};
		for (var attribute in this.vertexBuffers) {
			var buf = this.vertexBuffers[attribute];
			res.a[attribute] = buf.pushView(quad.a[attribute]);
			res.b[attribute] = buf.pushView(quad.b[attribute]);
			res.c[attribute] = buf.pushView(quad.c[attribute]);
			res.d[attribute] = buf.pushView(quad.d[attribute]);
		}

		var idx = this.lastIdx;
		var tris = this.indexBuffers.triangles;
		tris.push([idx, idx+2, idx+1]);
		tris.push([idx, idx+3, idx+2]);
		this.lastIdx += 4;

		return res;
	},
}