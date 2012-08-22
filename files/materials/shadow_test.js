
var mat = new Materials.Material('shadow_test');

mat.init = function() {
	
	this.shader = Shaders.get('shadow_test');
	this.mode = gl.TRIANGLES;
	this.pre = {
		shadowMapMatrix : null,
        sampleCount     : 0,
        light           : null,
        lightmapMult    : 1,
	};
	this.per = {
        transform       : null,
		lightmapOff     : null,
	};
}

mat.connect = function(atlas) {
	this.pre.lightmapMult = atlas.delta;
}

mat.setLight = function(shadowMapMatrix, light) {
	this.pre.shadowMapMatrix = shadowMapMatrix;
	this.pre.light = light;
}

mat.incSample = function() {
	this.pre.sampleCount++;
}