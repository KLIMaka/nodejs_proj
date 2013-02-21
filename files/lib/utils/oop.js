
function clone(constructor, object) {
  constructor.prototype = object;
  return new constructor();
}
 
function forEachIn(object, action) {
  for (var property in object) {
    if (object.hasOwnProperty(property))
      action(property, object[property]);
  }
}

function ensureNamespace(name) {
  var parts = name.split('.');
  var index = 0;
  var curr = window, cont = window;
  while (index < parts.length) {
    var curname = parts[index++];
    if (!(curname in curr))
      curr[curname] = {};
    cont = curr;
    curr = curr[curname];
  }
  return {cont : cont, curname : curname};
}

function assignTo(name, value) {
  var place = ensureNamespace(name);
  place.cont[place.curname] = value;
  return value;
}

var Class = function(name) {
  return {
    name : name,
    extendClass : {
      create : function() {
        var object = clone(this.classConstructor, this);
        if (typeof object.construct == "function")
          object.construct.apply(object, arguments);
        return object;
      },
           
      extend : function(constructor, properties) {
        var result = clone(constructor, this);
        forEachIn(properties, function(name, value) {
          result[name] = value;
        });
        result.classConstructor = constructor;
        return result;
      }
    },

    extend : function(extendClass) {
      this.extendClass = extendClass;
      return this;
    },

    implement : function(interfaces) {
      this.interfaces = interfaces;
      return this;
    },

    define : function(properties) {
      ensureNamespace(this.name);
      var constructor = eval(this.name + "=function(){}");
      var clazz = assignTo(this.name, this.extendClass.extend(constructor, properties));
      if (this.interfaces != undefined) {
        for (var key in this.interfaces) {
          var inter = this.interfaces[key];
          if (!checkInterface(inter, clazz)) {
            throw new Error('unimplmented interface ' + inter.toString() + ' in class ' + this.name);
          }
        }
      }
      return clazz;
    },
  }
};
 
function memberCheck(m1, m2) {
  if (typeof(m1) == typeof(m2))
    if (typeof(m1) == 'function' && m1.length == m2.length) 
      return true;
  return false;
}
 
function checkInterface(interface_, class_) {
  var keys = Object.keys(interface_);
  for (var key in keys) {
    var name = keys[key];
    var m1 = interface_[name];
    var m2 = class_[name];
    if (!memberCheck(m1, m2))
      return false;
  }
  return true;
}
