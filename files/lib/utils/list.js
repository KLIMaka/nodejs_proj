
Namespace('Ulils.List', Class.extend({

	construct : function(obj) {
		this.obj = obj;
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
		list.prev = this;
	},

	linkPrev : function(list) {
		this.prev = list;
		list.next = this;
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
		prev.linkNext(list);
	},

	replace : function(list) {
		
	}

}));