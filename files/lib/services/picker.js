
Namespace('Services.Picker', {

	pick : function(){
		var pow8  = Math.pow(2,8);
		var pow16 = Math.pow(2,16);	
		var pow24 = Math.pow(2,24);
		var pdata = new Uint8Array(4);

		return function(x, y) {
			gl.readPixels(x, gl.drawingBufferHeight-y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pdata);
			return pdata[0] + pdata[1]*pow8 + pdata[2]*pow16;
		}
	}(),
});