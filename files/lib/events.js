
Namespace('Events');

Events.CallbacksList = function() {

	this.last = 0;
	this.list = {};
}

Events.CallbacksList.prototype = {

	get : function(callback) {
		var list = this.list;
		for (var i in list) {
			if (callback == list[i]) return list[i];
		}
		return null;
	},

	getById : function(id) {
		return this.list[id];
	},

	add : function(callback) {
		if (this.get(callback) == null) {
			this.list[this.last++] = callback;
		}
		return callback;
	},

	remove : function(callback) {
		var list = this.list;
		for (var i in list) {
			if (callback == list[i]) {
				delete list[i];
				return true;
			}
		}
		return false;
	},

	each : function(data) {
		var list = this.list;
		for (var i in list) {
			list[i](data);
		}
	},
}

Events.Handler = function() {

	this.events = [];
}

Events.Handler.prototype = {

	add :  function(event, callback) {

		var list = this.events[event];
		if (list == undefined) {
			list = new Events.CallbacksList();
			this.events[event] = list;
		}
		return list.add(callback);
	},

	remove : function(event, callback) {

		var list = this.events[event];
		if (list == undefined) return false;
		return list.remove(callback);
	},

	run : function(event, data) {
		var list = this.events[event];
		if (list == undefined) return false;
		list.each(data);
	},
}