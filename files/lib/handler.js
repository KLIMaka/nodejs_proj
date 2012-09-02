
function AxisHandle(axis, angles, color) {

	this.axis = axis;
	this.handle = new Entity.Model('models/pivot.obj');
	this.setAnglesVec(angles);
	this.uniforms.color = color;
}

AxisHandle.prototype = {

	connect : function() {
		this.handle.setPosVec(ent.position.add(this.axis));
	}
}

function Handler() {

	this.x = 
}