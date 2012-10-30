
Namespace.include('lib.events');

Namespace('Controller');

Controller.MouseControl = function() {

	this.x = 0;
	this.y = 0;
	this.buttons = {};
	this.handlers = new Events.Handler();

	var self = this;
	
	gl.onmousemove = function(e) {
		self.x = e.x;
		self.y = e.y;
		self.move();
	}

	gl.onmouseup = function(e) {
		self.buttons[e.button] = false;
		self.up(e.button);
	}

	gl.onmousedown = function(e) {
		self.buttons[e.button] = true;
		self.down(e.button);
	}
}

Controller.MouseControl.prototype = {

	move : function() {
		this.handlers.run('move', this);
	},

	up : function(btn) {
		this.handlers.run('up'+btn, this);
	},

	down : function(btn) {
		this.handlers.run('down'+btn, this);
	},
}