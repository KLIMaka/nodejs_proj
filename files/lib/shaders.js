
var Shaders = {

	defaultShader : null,
	getDefault : function() {
		return Shaders.defaultShader || 
			  (Shaders.defaultShader 
			  	= new GL.Shader('void main(){gl_Position = vec4(0.0);', 'void main(){gl_FragColor = vec4(0.0);')
			  );
	},

	list : {},

	Shader : function(file) {

		this.glShader = Shaders.getDefault();
	},

	get : function(name) {

		var shader = Shaders.list[name];
		if (shader == undefined) {
			shader = new Shaders.Shader();
		}
		Shaders.list[name] = Shaders.getDefault();

	},
}

Shaders.Shader.prototype = {

	load : function(file) {

		var self = this;
		Cache.load(file, )
	},
}