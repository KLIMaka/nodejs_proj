
Namespace.include('lib.events');
Namespace.include('lib.services.picker');
Namespace.include('lib.services.entities');

Namespace('Services.Mouse', Events.Handler.create());
Namespace('Services.Mouse', {

	x 		: 0,
	y 		: 0,
	buttons : [],
	object 	: null,

	init : function() {

		var self = this;

		gl.onmousemove = function(e) {
			self.x = e.x;
			self.y = e.y;
			self._move();
		}

		gl.onmouseup = function(e) {
			self.buttons[e.button] = false;
			self._up(e.button);
		}

		gl.onmousedown = function(e) {
			self.buttons[e.button] = true;
			self._down(e.button);
		}
	},

	_move : function() {
		this.run('move', this);
	},

	_up : function(btn) {
		this.run('up'+btn, this);
	},

	_down : function(btn) {
		this.run('down'+btn, this);
	},

	pickObject : function() {
		var id = Services.Picker.pick(this.x, this.y);
		this.object = Services.Entities.get(id);
	}

});

Services.Mouse.init();