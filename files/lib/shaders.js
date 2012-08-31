
var Shaders = {

	defaultShader : null,
	getDefault : function() {
		return Shaders.defaultShader || 
			  (Shaders.defaultShader 
			  	= new GL.Shader('void main(){gl_Position = vec4(0.0);}', 'void main(){gl_FragColor = vec4(0.0);}')
			  );
	},

	Shader : function() {
		this.id = Shaders.lastID++;
		this.glShader = Shaders.getDefault();
	},

	lastID : 1,
	list : {},


	get : function(name) {

		var shader = Shaders.list[name];
		if (shader == undefined) {
			shader = new Shaders.Shader();
			Cache.load('shaders/'+name+'.glsl', function(data){
				shader.glShader = new GL.Shader(data.vsh, data.fsh);
			});
			Shaders.list[name] = shader;
		}
		return shader;
	},
}

var Materials = {

	list : {},
	lastID : 1,

	Material : function(name) {

		this.name = name;
		this.id = Materials.lastID++;
		this.mode = 0;
		this.shader = null;
		this.inited = false;
		
		Materials.list[name] = this;
	},

	get : function(name) {
		
		var mat = Materials.list[name];
		if (mat && !mat.inited)
			mat.init();
		return mat;
	}
}



Materials.Material.prototype = {

	begin : function() {
		if (this.onBegin) this.onBegin();
		if (this.pre) this.shader.glShader.uniforms(this.pre);
	},

	end : function() {
		if (this.onEnd) this.onEnd();
		if (this.post) this.shader.glShader.uniforms(this.post);
	},

	draw : function(obj) {
		var shader = this.shader.glShader;
		if (!shader) return;
		
		var per = this.per;
		if (per) {
			for(i in per) if (obj.uniforms[i]) per[i] = obj.uniforms[i]; else per[i] = this.default_per[i];
			shader.uniforms(per); 
		}

		shader.draw(obj.mesh, this.mode);
	},

	drawBuffers : function(obj, vertexBuffers, indexBuffer) {
		var shader = this.shader.glShader;
		var per = this.per;
		if (per) {
			for(i in per) per[i] = obj.uniforms[i];
			shader.uniforms(per); 
		}

		shader.drawBuffers(vertexBuffers, indexBuffer, this.mode, obj.idx, obj.len);
	}
}