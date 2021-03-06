
Utils.SentinelList.Entry = function(){};
Namespace('Utils.SentinelList.Entry', Class.extend(Utils.SentinelList.Entry, {

	construct : function(obj) {
		this.obj = obj == undefined ? null : obj;
		this.next = null;
		this.prev = null;
	},

	clear : function() {
		this.next = null;
		this.prev = null;
		this.obj = null;
	},

}));

Utils.SentinelList = function(){};
Namespace('Utils.SentinelList', Class.extend(Utils.SentinelList, {

	construct : function(obj) {
		this.nil = Utils.SentinelList.Entry.create();
		this.nil.next = this.nil;
		this.nil.prev = this.nil;
	},

	insertBefore : function(obj, ref) {
		
		ref = ref == undefined ? this.first() : ref;
		var ent = Utils.SentinelList.Entry.create(obj);
		
		ent.next = ref;
		ent.prev = ref.prev;
		ent.prev.next = ent;
		ref.prev = ent;

		return this;
	},

	insertAfter : function(obj, ref) {

		ref = ref == undefined ? this.last() : ref;
		var ent = Utils.SentinelList.Entry.create(obj);

		ent.next = ref.next;
		ent.next.prev = ent;
		ref.next = ent;
		ent.prev = ref;

		return this;
	},

	first : function() {
		return this.nil.next;
	},

	last : function() {
		return this.nil.prev;
	},

	remove : function(ref) {
		if (ref !== this.nil) {
			ref.next.prev = ref.prev;
			ref.prev.next = ref.next;
			ref.clear();
		}
		return this;
	},

	find : function(obj) {

		var node = this.first();
		while (node !== this.nil) {
			if (node.obj === obj) {
				return node;
			}
			node = node.next;
		}

		return null;
	},

}));

Utils.List = function(){};
Namespace('Utils.List', Class.extend(Utils.List, {

	construct : function(obj) {
		this.obj = obj == undefined ? null : obj;
		this.prev = null;
		this.next = null;
	},

	fromArray : function(array) {
		var head = Utils.List.create(array[0]);
		for (var i = 1; i < array.length; i++) {
			head.pushBack(Utils.List.create(array[i]));
		}
		return head;
	},

	unlink : function() {
		this.obj = null;
		this.prev = null;
		this.next = null;
	},

	last : function() {
		var node = this;
		while (node.next != null) node = node.next;
		return node;
	},

	first : function() {
		var node = this;
		while (node.prev != null) node = node.prev;
		return node;
	},

	linkNext : function(list) {
		this.next = list;
		if (list != null) list.prev = this;
	},

	linkPrev : function(list) {
		this.prev = list;
		if (list != null) list.next = this;
	},

	pushBack : function(list) {
		this.last().linkNext(list);
	},

	pushFront : function(list) {
		this.first().linkPrev(list.last());
	},

	insertAfter : function(list) {
		var next = this.next;
		this.linkNext(list);
		list.last().linkNext(next);
	},

	insertBefore : function(list) {
		var prev = this.prev;
		this.linkPrev(list.last());
		if (prev != null) prev.linkNext(list);
	},

	insert : function(obj) {
		if (this.obj == null) {
			this.obj = obj;
		} else {
			this.insertAfter(Utils.List.create(obj));
		}
	},

	remove : function(obj) {

		var node = this;
		while (node != null && node.obj !== obj) node = node.next;
		if (node != null && node !== this) {
			node.prev.linkNext(node.next);
			node.unlink();
		} else if (node != null && node === this) {
			if (this.next != null) {
				var next = this.next;
				this.obj = this.next.obj;
				this.linkNext(next.next);
				next.unlink();
			} else {
				this.obj = null;
			}
		}
	},

	removeThis : function() {

		if (this.next == null) {
			this.obj = null;
		} else {
			var next = this.next;
			this.obj = next.obj;
			this.next = next.next;
			this.linkNext(next.next);
			next.unlink();
		}
	},

	replace : function(obj, list) {
		
		var node = this;
		while (node != null && node.obj !== obj) node = node.next;

		if (node != null && node !== this) {
			list.linkPrev(node.prev);
			list.last().linkNext(node.next);
			node.unlink();
		} else if (node != null && node === this) {
			this.obj = list.obj;
			if (list.next != null) {
				this.insertAfter(list.next);
			}
		}
	},

	toString : function() {
		var node = this;
		var vals = [];
		while (node != null) {
			vals.push(node.obj.toString());
			node = node.next;
		}
		return '(' + vals.join(', ') + ')';
	},

}));