
Namespace.include('lib.utils.holder');
Namespace('Events');

Events.Handler = Class.extend({

	construct : function() {
		this.events = [];
	},

	register : function(event, callback) {

		var list = this.events[event];
		if (list == undefined) {
			list = new Utils.Holder();
			this.events[event] = list;
		}
		return list.add(callback);
	},

	run : function(event, data) {
		var list = this.events[event];
		if (list == undefined) return false;
		list.callEach(data);
	},
});
