
function forEachIn(object, action) {
	for (var property in object) {
		if (object.hasOwnProperty(property))
		action(property, object[property]);
	}
}

function clone(object) {
	function F(){}
	F.prototype = object;
	return new F();
}

var Class = {

	inherit : function(base) {
		this.prototype = clone(base.prototype);
		this.prototype.constructor = this;
	},

	create : function() {
		var object = clone(this);
		if (typeof object.construct == "function")
			object.construct.apply(object, arguments);
		return object;
	},

	extend : function(properties) {
		var result = clone(this);
		forEachIn(properties, function(name, value) {
			result[name] = value;
		});
		return result;
	}
};