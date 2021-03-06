
Utils.Holder.Ref = function(){};
Namespace('Utils.Holder.Ref', Class.extend(Utils.Holder.Ref, {

	construct : function(holder, id) {
		this.holder = holder;
		this.id = id;
	},

	remove : function() {
		delete this.holder.list[id];
	},

	get : function() {
		return this.holder.list[id];
	},

	set : function(obj) {
		this.holder.list[id] = obj;
	},

}));

Utils.Holder = function(){};
Namespace('Utils.Holder', Class.extend(Utils.Holder, {

	construct : function() {
		this.list = {};
		this.last = 0;
	},

	add : function(obj) {
		var id = this.last;
		this.list[id] = obj;
		this.last++;
		return Utils.Holder.Ref.create(this, id);
	},

	get : function(id) {
		return this.list[id];
	},

	getId : function(obj) {
		var list = this.list;
		for (var i in list) {
			if (obj === list[i])
				return i;
		}
		return null;
	},

	remove : function(id) {
		delete this.list[id];
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

	toString : function() {
		var list = this.list;
		var strs = [];
		for (var i in list) {
			strs.push(list[i].toString());
		}
		return '['+ strs.join(', ') +']';
	},

}));