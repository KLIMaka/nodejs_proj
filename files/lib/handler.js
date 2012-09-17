
function AxisHandle(handler, axis, angles, color) {

	this.axis = axis;
	this.handle = new Entity.Model('models/pivot.obj');
	this.handle.setAnglesVec(angles);
	this.handle.uniforms.color = color;

	this.handler = handler;
}

AxisHandle.prototype = {

	update : function(ent) {
		this.handle.setPosVec(ent.position.add(this.axis));
	},

	onmousedown : function(e) {

		var tracer = new GL.Raytracer();
        var ray = tracer.getRayForPixel(e.x, e.y);
        this.handler.hit = GL.Raytracer.hitTestMesh(tracer.eye, ray, this.handle).hit;
        this.handler.originalOffset = this.handle.position.clone();
	},

	drag : function(e) {

		var original_hit = this.handler.hit;
        var tracer = new GL.Raytracer();
        var ray = tracer.getRayForPixel(e.x, e.y);
        var t = original_hit.subtract(tracer.eye).dot(this.axis) / ray.dot(this.axis);
        var hit = tracer.eye.add(ray.multiply(t));
        var offset = originalOffset.add(hit.subtract(original_hit));
        this.handler.ent.setPosVec(GL.Vector.snap(offset.subtract(this.axis), 1));
        this.handler.update();
	},
}

function Handler() {

	this.visible = false;
	this.xHandle = new AxisHandle(this, new GL.Vector(1,0,0), new GL.Vector(0,0,-90), [1,0,0,1]);
	this.yHandle = new AxisHandle(this, new GL.Vector(0,1,0), new GL.Vector(0,0,0),   [0,1,0,1]);
	this.xHandle = new AxisHandle(this, new GL.Vector(0,0,1), new GL.Vector(90,0,0),  [0,0,1,1]);
}

Handler.prototype = {

	connect : function(ent) {
		this.ent = ent;
	},

	update : function() {

		this.xHandle.update(this.ent);
		this.yHandle.update(this.ent);
		this.zHandle.update(this.ent);
	},

	draw : function(mat) {

		if (!this.visible) return;

		mat.begin();
        mat.draw(this.xHandle);
        mat.draw(this.yHandle);
        mat.draw(this.zHandle);
	},

}
