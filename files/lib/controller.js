
Namespace.include('lib.events');
Namespace.include('lib.services.picker');
Namespace.include('lib.services.entities');

Namespace('Controller');

Controller.MouseControl = Events.Handler.extend({

	construct : function() {
		Events.Handler.construct.call(this);

		this.x = 0;
		this.y = 0;
		this.buttons = {};
		this.object = null;

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