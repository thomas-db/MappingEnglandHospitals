var express = require('express')
var app = express()

app.set("view engine", "hbs")
app.get('/', function(request, response){
       response.render('index.hbs')
})

app.listen(3000)
