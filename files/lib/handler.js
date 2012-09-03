
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

	this.x = 
}

Handler.prototype = {


}
