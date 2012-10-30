
Namespace.include('lib.utils.holder');

Namespace('Services.Entities', {

	list   : {},
	lastId : 0,

	get : function(id) {
		return Services.Entities.list[id];
	},

	genID : function() {
	var id = Services.Entities.lastId;
		Services.Entities.lastId++;
		return id;
	},

	put : function(id, ent) {
		Services.Entities.list[id] = ent;
	},

	intTo4Bytes : function(val) {
		return [(val&0xff), ((val>>>8)&0xff), ((val>>>16)&0xff), ((val>>>24)&0xff)];
	},
});
