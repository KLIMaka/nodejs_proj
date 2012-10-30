
Namespace('Utils');

Utils.Holder = function() {
	this.last = 0;
	this.list = {};
}

Utils.Holder.prototype = {

	add : function(obj) {
		var id = this.last;
		this.list[id] = obj;
		return new Utils.Holder.Ref(this, id);
	},

	get : function(id) {
		return this.list[id];
	},

	toArray : function() {
		var list = this.list;
		var arr = [];
		for (var i in list) {
			arr.push(list[i]);
		}
		return arr;
	},

	callEach : function(arg) {
		var list = this.list;
		for (var i in list) {
			list[i](arg);
		}
	},
}

Utils.Holder.Ref = function(holder, id) {
	this.holder = holder;
	this.id = id;
}

Utils.Holder.Ref.prototype = {

	remove : function() {
		delete this.holder.list[id];
	},

	get : function() {
		return this.holder.list[id];
	},

	set : function(obj) {
		this.holder.list[id] = obj;
	},
}