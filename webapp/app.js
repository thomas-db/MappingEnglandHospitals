var express = require('express')
var app = express()
var requirejs = require('requirejs');

app.use(express.static('public'));
app.use('/scripts', express.static('public'));
app.use('/node_modules', express.static('node_modules'));
app.set("view engine", "hbs");
app.get('/', function(request, response){
       response.render('index.hbs')
});
app.get('/meh', function(request, response){
       response.send("hello world")
});
app.listen(3000)
