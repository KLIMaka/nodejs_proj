
Namespace('Tools.Move');

Tools.Move.enable = function(controller) {

	Tools.Move.enabled = true;
	controller.handlers.add('down0', Tools.Move.down);
	controller.handlers.add('up0', Tools.Move.up);
	controller.handlers.add('move', Tools.Move.move);
}

Tools.Move.isActive = function() {
	return Tools.Move.ent != null;
}

Tools.Move.down = function(mouse) {
	if (!Tools.Move.enabled) return;

	var ent = Entity.get(Services.Pick.id);
	if (ent != null && ent.grab != undefined) {
		Tools.Move.ent = ent;
		ent.grab(mouse);
	}
}

Tools.Move.up = function(mouse) {
	if (!Tools.Move.enabled) return;
	if (!Tools.Move.isActive()) return;

	var ent = Tools.Move.ent;
	if (ent.drop != undefined) {
		ent.drop(mouse);
	}

	Tools.Move.ent = null;
}

Tools.Move.move = function(mouse) {
	if (!Tools.Move.enabled) return;
	if (!Tools.Move.isActive()) return;

	var ent = Tools.Move.ent;
	if (ent.drag != undefined) {
		ent.drag(mouse);
	}
}