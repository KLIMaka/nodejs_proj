Namespace.include('lib.services.mouse');

Namespace('Tools.Move', {

	enable : function() {

		Tools.Move.enabled = true;
		var mouse = Services.Mouse;
		mouse.register('down0', Tools.Move._down);
		mouse.register('up0', Tools.Move._up);
		mouse.register('move', Tools.Move._move);
	},

	isActive : function() {
		return Tools.Move.ent != null;
	},

	_down : function(mouse) {
		if (!Tools.Move.enabled) return;

		var ent = mouse.object;
		if (ent != null && ent.grab != undefined) {
			Tools.Move.ent = ent;
			ent.grab(mouse);
		}
	},

	_up : function(mouse) {
		if (!Tools.Move.enabled) return;
		if (!Tools.Move.isActive()) return;

		var ent = Tools.Move.ent;
		if (ent.drop != undefined) {
			ent.drop(mouse);
		}

		Tools.Move.ent = null;
	},

	_move : function(mouse) {
		if (!Tools.Move.enabled) return;
		if (!Tools.Move.isActive()) return;

		var ent = Tools.Move.ent;
		if (ent.drag != undefined) {
			ent.drag(mouse);
		}
	}

});

Tools.Move.enable();