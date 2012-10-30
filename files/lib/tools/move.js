
Namespace('Tools.Move', {

	enable : function(controller) {

		Tools.Move.enabled = true;
		controller.register('down0', Tools.Move.down);
		controller.register('up0', Tools.Move.up);
		controller.register('move', Tools.Move.move);
	},

	isActive : function() {
		return Tools.Move.ent != null;
	},

	down : function(mouse) {
		if (!Tools.Move.enabled) return;

		var ent = mouse.object;
		if (ent != null && ent.grab != undefined) {
			Tools.Move.ent = ent;
			ent.grab(mouse);
		}
	},

	up : function(mouse) {
		if (!Tools.Move.enabled) return;
		if (!Tools.Move.isActive()) return;

		var ent = Tools.Move.ent;
		if (ent.drop != undefined) {
			ent.drop(mouse);
		}

		Tools.Move.ent = null;
	},

	move : function(mouse) {
		if (!Tools.Move.enabled) return;
		if (!Tools.Move.isActive()) return;

		var ent = Tools.Move.ent;
		if (ent.drag != undefined) {
			ent.drag(mouse);
		}
	}

});