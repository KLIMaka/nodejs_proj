function clone(constructor, object) {
  constructor.prototype = object;
  return new constructor();
}

function forEachIn(object, action) {
  for ( var property in object) {
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
  return {
    cont : cont,
    curname : curname
  };
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

    implements : function(interfaces) {
      if (typeof (interfaces) == 'array')
        this.interfaces = interfaces;
      else
        this.interfaces = [ interfaces ];
      return this;
    },

    define : function(properties) {
      ensureNamespace(this.name);
      var constructor = eval(this.name + "=function(){}");
      var clazz = assignTo(this.name, this.extendClass.extend(constructor,
          properties));
      if (this.interfaces != undefined) {
        for ( var key in this.interfaces) {
          var inter = this.interfaces[key];
          if (!checkType(inter, clazz)) {
            throw new Error('unimplmented interface ' + inter.toString()
                + ' in class ' + this.name);
          }
        }
      }
      return clazz;
    }
  };
};

function define(args, ret, body) {
  return function() {
    if (arguments.length != args.length)
      throw new Error("Wrong number of arguments");
    for (var i in args)
      if (!checkType(arguments[i], args[i])) 
        throw new Error("Wrong arguments type");
    var res = body.apply(this, arguments);
    if (!checkType(ret, res))
      throw new Error("Wrong return type");
    return res;
  };
}

function memberCheck(m1, m2) {
  if (typeof (m1) == typeof (m2))
    if (typeof (m1) == 'function' && m1.length == m2.length)
      return true;
  return false;
}

function checkType(interface_, class_) {
  var keys = Object.keys(interface_);
  for ( var key in keys) {
    var name = keys[key];
    var m1 = interface_[name];
    var m2 = class_[name];
    if (!memberCheck(m1, m2))
      return false;
  }
  return true;
}
