
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
    console.log(err);
    res.end();
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(1234);
  console.log("Express server listening on port %d", app.address().port);
}
