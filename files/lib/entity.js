
var Entity = {

	lastID : 1,
	dummyMesh : null,
	ents : {},

	genID : function() {
		return Entity.lastID++
	},

	intTo4Bytes : function(val) {
		return [(val&0xff)/256, ((val>>>8)&0xff)/256, ((val>>>16)&0xff)/256, ((val>>>24)&0xff)/256];
	},

	getDummyMesh : function() {
		return Entity.dummyMesh || (Entity.dummyMesh = GL.Mesh.cube({coords:true}));
	},

	get : function(id) {
		return this.ents[id];
	},

	meshes : {},
	getMesh : function(name) {

		var mesh = Entity.meshes[name];
		if (mesh == undefined)
			return null;
		return mesh;
	},

	Model : function(file) {

		this.id        = Entity.genID();
		this.mesh      = Entity.getDummyMesh();
		this.transform = new GL.Matrix();
		this.position  = new GL.Vector();
		this.scale     = new GL.Vector();
		this.angles    = new GL.Vector();
		this.selectable = true;

		this.uniforms = {
			id        : Entity.intTo4Bytes(this.id),
			transform : this.transform,
		}

		if (file != undefined)
			this.load(file);

		Entity.ents[this.id] = this;
	},

	WireBuilder : function() {

		this.mesh = new GL.Mesh({lines : true});
		this.lastIdx = 0;
	}
}

Entity.WireBuilder.prototype = {

	addLine : function(x1, y1, z1, x2, y2, z2) {
		this.mesh.vertices.push([x1, y1, z1]);
		this.mesh.vertices.push([x2, y2, z2]);
		this.mesh.lines.push(this.lastIdx, this.lastIdx + 1);
		this.lastIdx += 2;
	},

	buildGrid : function(x1, y1, x2, y2, n) {

		var x = 0, dx = (x2-x1)/n, y = y1, dy = (y2-y1)/n;
		for(var i = 0; i <= n; i++) {
			this.addLine(x1 + i*dx, 0, y1, x1 + i*dx, 0, y2);
			this.addLine(x1, 0, y1 + i*dy, x2, 0, y1 + i*dy);
		}

		return this.compile();
	},

	buildGrid2D : function(x1, y1, x2, y2, n) {

		var dx = (x2-x1)/n, dy = (y2-y1)/n;
		for (var i = 0; i <= n; i++) {
			this.addLine(x1 + i*dx, y1, 0, x1 + i*dx, y2, 0);
			this.addLine(x1, y1 + i*dy, 0, x2, y1 + i*dy, 0);
		}

		return this.compile();
	},

	compile : function() {
		var model = new Entity.Model();
		this.mesh.compile();
		model.mesh = this.mesh;
		return model;
	},
}

Entity.Model.prototype = {

	load : function(file) {

		var self = this;
		Cache.load(file, function(mesh_data){
			var mesh = Entity.meshes[file];
			if (mesh != null) {
				self.mesh = mesh;
				return;
			}

			self.mesh = GL.Mesh.load(mesh_data);
			Entity.meshes[file] = self.mesh;
			if (self.onMeshLoadedCallback) self.onMeshLoadedCallback(self);
			self.calcBBox();
		});
		return this;
	},

	onMeshLoaded : function(callback) {
		this.onMeshLoadedCallback = callback;
	},

	setMaterial : function(mat) {
		this.material = mat;
		if (mat.onBind) mat.onBind(this);
		return this;
	},

	draw : function() {
		var mat = this.material;
		if (mat) {
			mat.begin();
			mat.draw(this);
		}
	},

	recalcPosition : function() {
		this.transform.m[3]  = this.position.x;
		this.transform.m[7]  = this.position.y;
		this.transform.m[11] = this.position.z;
		return this;
	},

	rercalcScale : function() {
		this.transform.m[0]  = this.scale.x;
		this.transform.m[5]  = this.scale.y;
		this.transform.m[10] = this.scale.z;
		return this;
	},

	recalcAll : function() {

		var s = this.scale;
		var r = this.angles;
		var tmp = GL.Matrix.scale(s.x, s.y, s.z);
		tmp = GL.Matrix.multiply(tmp, GL.Matrix.rotate(r.x, 1, 0, 0));
		tmp = GL.Matrix.multiply(tmp, GL.Matrix.rotate(r.y, 0, 1, 0));
		tmp = GL.Matrix.multiply(tmp, GL.Matrix.rotate(r.z, 0, 0, 1));
		this.transform = tmp;
		this.uniforms.transform = tmp;
		return this.recalcPosition();
	},

	setAngles : function(x, y, z) {
		this.angles.init(x ,y, z);
		return this.recalcAll();
	},

	setAnglesVec : function(a) {
		this.angles.init(a.x, a.y, a.z);
		return this.recalcAll();
	},

	setPosVec : function(pos) {
		this.position.init(pos.x, pos.y, pos.z);
		return this.recalcPosition();
	},

	setPos : function(x, y, z) {
		this.position.init(x, y, z);
		return this.recalcPosition();
	},

	setPosSS : function(x, y) {
		this.position.init(x, gl.drawingBufferHeight - y, 0.0);
		return this.recalcPosition();
	},

	moveVec : function(dPos) {
		this.position.x += dPos.x;
		this.position.y += dPos.y;
		this.position.z += dPos.z;
		return this.recalcPosition();
	},

	move : function(dx, dy, dz) {
		this.position.x += dx;
		this.position.y += dy;
		this.position.z += dz;
		return this.recalcPosition();
	},

	setScaleVec : function(sVec) {
		this.scale.init(sVec.x, sVec.y, sVec.z);
		return this.rercalcScale();
	},

	setScale : function(s) {
		this.scale.init(s, s, s);
		return this.rercalcScale();
	},
	
	setScaleComp : function(sx, sy, sz) {
		this.scale.init(sx, sy, sz);
		return this.rercalcScale();
	},

	bbox : function() {
		return this._bbox || this.calcBBox();
	},

	calcBBox : function() {

		var bbox = {
			scale    : null,
			position : null,
		}

		var aabb = this.mesh.getAABB();
		bbox.scale = aabb.max.subtract(aabb.min).divide(2.0);
		bbox.position = aabb.max.subtract(bbox.scale);
		this._bbox = bbox;

		return this._bbox;
	}
}
