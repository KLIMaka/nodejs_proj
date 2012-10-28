
function StaticBuffer(target, type, length, spacing, normalized) {
	
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

function Mesh2D(options) {

	this.vertexBuffers = {};
	this.indexBuffers = {};
	this.length = options.length;

	var attrs = options.attrs;
	for (var attribute in attrs) {
		this.addVertexBuffer(attribute, attrs[attribute].size, attrs[attribute].type, attrs[attribute].normalized);
	}
	this.addIndexBuffer('triangles', 3);

	this.lastIdx = 0;
}

Mesh2D.prototype = {

	addVertexBuffer : function(attribute, size, type, normalized) {
		var buffer = this.vertexBuffers[attribute] = new StaticBuffer(gl.ARRAY_BUFFER, type || Float32Array, this.length*4, size, normalized);
	},

	addIndexBuffer : function(name, size) {
		var buffer = this.indexBuffers[name] = new StaticBuffer(gl.ELEMENT_ARRAY_BUFFER, Uint16Array, this.length*2, size);
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