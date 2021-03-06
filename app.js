
/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Home'
  });
});

app.get('/about', function(req, res){
  res.render('about', {
    title: 'About'
  });
});

app.get('/contact', function(req, res){
  res.render('contact', {
    title: 'Contact'
  });
});

app.get('/info/:id', function(req, res){
  res.render('info', {
    title : 'Info',
    id : req.params.id,
  })
});

app.post('/info/:id', function(req, res) {
  res.render('info', {
    title : 'POST Info',
    id : req.body.name,
    oth : req.body.oth,
  });
})

app.get('/files', function(req, res){
  var files = fs.readdirSync('files');
  res.render('files', {
    title : 'Files',
    files : files,
  })
});

app.get(/^\/files\/(.+)$/, function(req, res) {
  res.sendfile('files/' + req.params[0], function(err){
    res.write('error!');
    res.end();
  });
});

var processor = {
	parsers : {
    
    'mat' : function(file, name) {
      var cont = fs.readFileSync('files/'+file, 'UTF-8');
      var parts = cont.split(/###\r?\n/);
      var vsh = parts[1].split(/\r?\n/).join('\\\n');
      var fsh = parts[2].split(/\r?\n/).join('\\\n');
      return 'var ' + name + ' = ' + parts[0] + ';' +
              name + '.vsh = "' + vsh + '";' + 
              name + '.fsh = "' + fsh + '";';
    },

		'glsl' : function(file, name) {
			var cont = fs.readFileSync('files/'+file, 'UTF-8');
      var parts = cont.split(/###\r?\n/);
      var vsh = parts[0].split(/\r?\n/).join('\\\n');
      var fsh = parts[1].split(/\r?\n/).join('\\\n');
			return 'var ' + name + ' = {vsh : "' + vsh + '",'+' fsh : "' + fsh + '"};';
		},

    'json' : function(file, name) {
      var cont = fs.readFileSync('files/'+file, 'UTF-8');
      return 'var ' + name + ' = ' + cont + ';';
    },

    'js' : function(file, name) {
      var cont = fs.readFileSync('files/'+file, 'UTF-8');
      return cont + '\nvar ' + name + ' = result;';
    },

    'obj' : function(file, name) {
      var cont = fs.readFileSync('files/'+file, 'UTF-8');
      var lines  = cont.split(/\r?\n/);
      var tri = 0;
      var result = {
        vertices : [],
        normals  : [],
        coords   : [],
        triangles: [],
        lines    : [],
      };
      var data = {
        verts : [],
        norms : [],
        vts   : [],
      };

      var unique = {};
      var addLine = function(id1, id2) {
        var line = [Math.min(id1,id2), Math.max(id1,id2)];
        var key = JSON.stringify(line);
        if (!(key in unique)) {
          result.lines.push(line);
          unique[key] = true;
        }
      }

      for (var n in lines) {
        var line = lines[n];
        if (line == '') continue;

        var com = line.match(/^([^ ]+) /)[1];
        if (com == undefined) continue;

        switch(com) {
          case 'v':
            var vert = line.match(/v ([0-9e\.\-]+) ([0-9e\.\-]+) ([0-9e\.\-]+)/);
            data.verts.push([parseFloat(vert[1]), parseFloat(vert[2]), parseFloat(vert[3])]);
            break;

          case 'vn':
            var norm = line.match(/vn ([0-9e\.\-]+) ([0-9e\.\-]+) ([0-9e\.\-]+)/);
            data.norms.push([parseFloat(norm[1]), parseFloat(norm[2]), parseFloat(norm[3])]);
            break;

          case 'vt':
            var vt = line.match(/vt ([0-9e\.\-]+) ([0-9e\.\-]+)/);
            data.vts.push([parseFloat(vt[1]), parseFloat(vt[2])]);
            break;

          case 'f':
            var t = line.match(/f ([0-9]+)\/([0-9]+)\/([0-9]+) ([0-9]+)\/([0-9]+)\/([0-9]+) ([0-9]+)\/([0-9]+)\/([0-9]+)( ([0-9]+)\/([0-9]+)\/([0-9]+))?/);
            result.vertices.push(data.verts[parseInt(t[1])-1]);
            result.vertices.push(data.verts[parseInt(t[4])-1]);
            result.vertices.push(data.verts[parseInt(t[7])-1]);
            if (t[10] != undefined)
              result.vertices.push(data.verts[parseInt(t[11])-1]);

            result.coords.push(data.vts[parseInt(t[2])-1]);
            result.coords.push(data.vts[parseInt(t[5])-1]);
            result.coords.push(data.vts[parseInt(t[8])-1]);
            if (t[10] != undefined)
              result.coords.push(data.vts[parseInt(t[12])-1]);

            result.normals.push(data.norms[parseInt(t[3])-1]);
            result.normals.push(data.norms[parseInt(t[6])-1]);
            result.normals.push(data.norms[parseInt(t[9])-1]);
            if (t[10] != undefined)
              result.normals.push(data.norms[parseInt(t[13])-1]);

            if (t[10] != undefined) {
              result.triangles.push([tri, tri+1, tri+2]);
              result.triangles.push([tri, tri+2, tri+3]);
              addLine(tri, tri+1);
              addLine(tri+1, tri+2);
              addLine(tri+2, tri+3);
              addLine(tri+3, tri);
              tri += 4;
            } else {
              result.triangles.push([tri, tri+1, tri+2]);
              addLine(tri, tri+1);
              addLine(tri+1, tri+2);
              addLine(tri+2, tri);
              tri += 3;
            }
        }
      }
      return 'var ' + name + ' = ' + JSON.stringify(result);
    }

	},
	
	process : function(file, name, format) {
		var parser = this.parsers[format];
		if (parser == undefined)
			return 'var ' + name + ' = null;';
		
		return parser(file, name);
	},
}

app.get(/^\/file_load\/([^\/]+)\/([^\.]+)\.(.+)/, function(req, res) {
	var format = req.params[2];
	var file = req.params[1] + '.' + format;
	var name = req.params[0];

  res.setHeader('Content-Type', 'text/javascript');
	res.end(processor.process(file, name, format));
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(1234);
  console.log("Express server listening on port %d", app.address().port);
}
