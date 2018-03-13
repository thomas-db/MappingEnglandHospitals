var express = require('express')
var app = express()
var requirejs = require('requirejs');
const { Connection, query } = require('stardog');

const conn = new Connection({
 username: 'admin',
 password: 'admin',
 endpoint: 'http://localhost:5820',
});

var all_hospitals = [];

query.execute(conn, 'hospitals', 'select distinct ?name ?lat ?long ?adress ?phone where {?x <http://xmlns.com/foaf/spec/name> ?name . ?x <http://w3.org/01/geo/lat> ?lat . ?x <http://w3.org/01/geo/long> ?long . ?x <http://schema.org/Hospitaladdress> ?adress . ?x <http://schema.org/Hospitaltelephone> ?phone }', {
   }).then(({ body }) => {
     body.results.bindings.forEach(function(elem){
             all_hospitals.push({name:elem.name.value,
                               lat:elem.lat.value,
                               long:elem.long.value,
                               adress:elem.adress.value,
                               phone:elem.phone.value})
                             });
                           });

app.use(express.static('public'));
app.use('/scripts', express.static('public'));
app.use('/node_modules', express.static('node_modules'));
app.set("view engine", "hbs");

app.get('/', function(request, response){
       response.render('index', {encodedJson : encodeURIComponent(JSON.stringify(all_hospitals))})
});

app.listen(3000)
