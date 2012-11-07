
Namespace.include('lib.utils.holder');

Namespace('Events.Handler', Class.extend({

	construct : function() {
		this.events = [];
	},

	register : function(event, callback) {

		var list = this.events[event];
		if (list == undefined) {
			list = Utils.Holder.create();
			this.events[event] = list;
		}
		return list.add(callback);
	},

	run : function(event, data) {
		var list = this.events[event];
		if (list == undefined) return false;
		list.callEach(data);
	},
}));
