
var Scene = {

	defaultGLShader : null,

	Shader : function(shader) {

		this.glShader =  Scene.defaultGLShader 
			         || (Scene.defaultGLShader = new GL.Shader('void main(){gl_Position = vec4(0,0,0,0);}', 'void main(){gl_FragColor = vec4(0,0,0,0);}'));

	    var self = this;
		Cache.load('shaders/'+shader+'.glsl', function(d){self.load(d.vsh, d.fsh);});
	},

	Drawer : function() {

		this.ents = {};
		this.shaders = {};
	},

	ObjectIterator : function(objs) {
		this.objs = objs;
		this.idxs = Object.keys(this.objs);
		this.current = 0;
		this.current_obj = this.objs[this.idxs[0]];
		this.end = this.current_obj == undefined;
	}
}

Scene.ObjectIterator.prototype = {

	get : function() {
		return this.current_obj;
	},

	next : function() {

		if (this.end) return null;

		if (this.current == this.idxs.lenght - 1) {
			this.end = true;
			this.current_obj = null;
			return null;
		}

		this.current_obj = this.objs[this.idxs[this.current++]];
		return this.current_obj;
	},

	reset : function() {
		this.idxs = Object.keys(this.objs);
		this.current = 0;
		this.current_obj = this.objs[this.idxs[0]];
		this.end = this.current_obj == undefined;
	},
}

Scene.Shader.prototype = {

	load : function(vsh, fsh) {
		this.glShader = new GL.Shader(vsh, fsh);
	},

	activate : function(options) {
		if (options.pre != undefined)
			this.glShader.uniforms(options.pre);
	},

	deactivate : function(options) {
		if (options.post != undefined)
			this.glShader.uniforms(options.post);
	},

	draw : function(obj, options) {

		var per = options.per;
		if (per) {
			for(i in per) per[i] = obj.uniforms[i];
			this.glShader.uniforms(per);
		}
		this.glShader.draw(obj.mesh, options.mode || gl.TRIANGLES);
	},
}

Scene.Drawer.prototype = {

	loadShader : function(file) {
		this.shaders[file] = new Scene.Shader(file);
	},

	objIterator : function() {
	},

	draw : function(shaderName, options) {

		var shader = this.shaders[shaderName];
		shader.activate(options);
		for (i in this.ents) {
			shader.draw(this.ents[i], options);
		}
		shader.deactivate(options);
	},

	drawMat : function() {
		
		var prevMat = 0;
		for(i in this.ents) {
			var ent = this.ents[i];
			var mat = ent.material;
			if (prevMat != mat.id) {
				mat.begin();
				prevMat = mat.id
			}
			mat.draw(ent);
		}
	},

	drawMatOverride : function(mat) {
		mat.begin();
		for (i in this.ents) {
			var ent = this.ents[i];
			mat.draw(ent);
		}
	},

	drawMatOverrideID : function(mat, id) {
		mat.begin();
		mat.draw(this.ents[id]);
	},

	drawID : function(id, shaderName, options) {
		
		var shader = this.shaders[shaderName];
		shader.activate(options);
		shader.draw(this.ents[id], options);
		shader.deactivate(options);
	},

	add : function(obj) {
		this.ents[obj.id] = obj;
	},

}