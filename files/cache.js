
var Cache = {


cache : {},
cacheListeners : {},
lastTmp : 0,

load : function(file, onload) {

	if (Cache.cache[file] != null) {
		onload(Cache.cache[file]);
		return;
	}
	
	if (Cache.cacheListeners[file] != undefined) {
		Cache.cacheListeners[file].push(onload);
		return;
	}

	var tmpID = Cache.lastTmp++;
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.src = '/file_load/id'+tmpID+'/' + file;
	script.type = 'text/javascript';
	Cache.cache[file] = null;
	Cache.cacheListeners[file] = [onload];

	script.onload = function() {
		var val = window['id'+tmpID];
		delete window['id'+tmpID];
		Cache.cache[file] = val;
		var listeners = Cache.cacheListeners[file];
		for (i in listeners) listeners[i](val);
		delete Cache.cacheListeners[file];
	}

	head.appendChild(script);
	Cache.cache[file];
}


}