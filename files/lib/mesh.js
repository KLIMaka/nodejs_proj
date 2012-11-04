
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
	DEFAULT_DRAWTYPE   : 'STREAM_DRAW',

	construct : function(length, elements, target, type, spacing, norm, drawtype) {

		this.target = target || gl[this.DEFAULT_TARGET];
		this.type   = type || this.DEFAULT_TYPE;
		this.spacing = spacing || this.DEFAULT_SPACING,
		this.drawtype = drawtype || this.DEFAULT_DRAWTYPE;
		this.length = length;
		this.elements = elements;

		this.data = new this.type(this.length * this.spacing);

		this.buffer = gl.createBuffer();
		this.buffer.length = this.length;
		this.buffer.spacing = spacing;
		this.buffer.normalized = norm || this.DEFAULT_NORMALIZED;
		this.buffer.type = GL1.Buffers.getGLType(this.type);

		gl.bindBuffer(this.target, this.buffer);
		gl.bufferData(this.target, this.length*this.spacing*this.data.BYTES_PER_ELEMENT, gl[this.drawtype]);

		this.updated = false;
		var self = this;
		this.filler = function(){var arr = new Array(self.spacing); for(var i=0; i<self.spacing*self.elements;i++)arr[i]=0; return arr;}();
	},

	set : function(idx, data) {
		this.data.set(data, idx*this.spacing*this.elements);
		this.setDirt();
	},

	getView : function(idx) {
		return new this.type(this.data.buffer, this.data.BYTES_PER_ELEMENT*idx*this.spacing*this.elements, this.spacing*this.elements);
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

Namespace("GL1.Mesh.QuadMesh", Class.extend({

	construct : function(length, attrs) {

		this.vertexBuffers = {};
		this.indexBuffers = {},
		this.length = length;

		for (var attr in attrs) {
			var adata = attrs[attr];
			this.addVertexBuffer(this.length, attr, adata.size, adata.type, adata.normalized);
		}

		this.addIndexBuffer(this.length, 'triangles', 3);

		this.lastIdx = 0;
		this.holes = {};
		this.holesCount = 0;
	},

	addVertexBuffer : function(length, attribute, size, type, normalized) {
		this.vertexBuffers[attribute] = GL1.Buffers.Preallocated.create(length, 4, gl.ARRAY_BUFFER, type, size, normalized);
	},

	addIndexBuffer : function(length, name, size) {
		this.indexBuffers[name] = GL1.Buffers.Preallocated.create(length, 2, gl.ELEMENT_ARRAY_BUFFER, Uint16Array, size);
	},

	addQuad : function(quad) {

		var buf_idx = this.lastIdx;
		if (this.holesCount != 0) {
			var hole = keys(this.holes)[0];
			buf_idx = hole;
			delete this.holes[hole];
			this.holesCount--;
			this.lastIdx--;
		}

		var res = {};
		for (var attr in this.vertexBuffers) {
			var buf = this.vertexBuffers[attr];
			res[attr] = buf.getView(buf_idx);
			buf.set(buf_idx, quad[attr]);
		}

		var tris = this.indexBuffers.triangles;
		var idx = buf_idx * 4;
		tris.set(buf_idx, [idx, idx+2, idx+1, idx, idx+3, idx+2]);

		this.lastIdx++;

		return res;
	},

	removeQuad : function(idx) {

		if (this.lastIdx <= idx || this.holes[idx] != undefined) 
			return;

		if (idx == this.lastIdx - 1) {
			this.lastIdx--;
		} else {
			this.holes[idx] = 1;
			this.holesCount++;
		}

		for (var attr in this.vertexBuffers) {
			var buf = this.vertexBuffers[attr];
			buf.set(idx, buf.filler);
		}

		for (var attr in this.indexBuffers) {
			var buf = this.indexBuffers[attr];
			buf.set(idx, buf.filler);
		}
	},

}));