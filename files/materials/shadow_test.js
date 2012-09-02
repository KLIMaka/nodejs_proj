
Materials.ShadowTest = function() {

	if (!Materials.ShadowTest.prototype.shader) Materials.ShadowTest.prototype.shader = Shaders.get('shadow_test');
	if (!Materials.ShadowTest.prototype.per )   Materials.ShadowTest.prototype.per = {transform : null, lightmapOff : null};
	if (!Materials.ShadowTest.prototype.mode)   Materials.ShadowTest.prototype.mode = gl.TRIANGLES;

	this.pre = {
		shadowMapMatrix : null,
        sampleCount     : 0,
        light           : null,
        lightmapMult    : 1,
	};
}

Materials.ShadowTest.prototype = new Materials.Material();

Materials.ShadowTest.prototype.connect = function(atlas) {
	this.pre.lightmapMult = atlas.delta;
}

Materials.ShadowTest.prototype.setLight = function(shadowMapMatrix, light) {
	this.pre.shadowMapMatrix = shadowMapMatrix;
	this.pre.light = light;
}

Materials.ShadowTest.prototype.incSample = function() {
	this.pre.sampleCount++;
}

Materials.register('shadow_test', Materials.ShadowTest);