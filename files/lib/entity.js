
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

	Model : function(file) {

		this.id        = Entity.genID();
		this.mesh      = Entity.getDummyMesh();
		this.transform = new GL.Matrix();
		this.position  = new GL.Vector();
		this.scale     = new GL.Vector();

		this.uniforms = {
			id        : Entity.intTo4Bytes(this.id),
			transform : this.transform,
		}

		if (file != undefined)
			this.load(file);

		Entity.ents[this.id] = this;
	}
}

Entity.Model.prototype = {

	load : function(file) {
		var self = this;
		Cache.load(file, function(mesh){
			self.mesh = GL.Mesh.load(mesh);
			if (self.onMeshLoadedCallback) self.onMeshLoadedCallback(self);
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

	setPosVec : function(pos) {
		this.position.init(pos.x, pos.y, pos.z);
		return this.recalcPosition();
	},

	setPos : function(x, y, z) {
		this.position.init(x, y, z);
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
}
