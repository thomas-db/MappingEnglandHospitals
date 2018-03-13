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

query.execute(conn, 'hospitals', 'select distinct ?name ?lat ?long ?adress ?phone ?city where {?x <http://xmlns.com/foaf/spec/name> ?name . ?x <http://w3.org/01/geo/lat> ?lat . ?x <http://w3.org/01/geo/long> ?long . ?x <http://schema.org/Hospitaladdress> ?adress . ?x <http://schema.org/Hospitaltelephone> ?phone . ?x <http://dbpedia.org/ontology/City> ?city }', {
   }).then(({ body }) => {
     body.results.bindings.forEach(function(elem){
             all_hospitals.push({name:elem.name.value,
                               lat:elem.lat.value,
                               long:elem.long.value,
                               adress:elem.adress.value,
                               phone:elem.phone.value,
                               city:elem.city.value})
                             });
                           });

app.use(express.static('public'));
app.use('/scripts', express.static('public'));
app.use('/node_modules', express.static('node_modules'));
app.set("view engine", "hbs");

// Index route
app.get('/', function(request, response){
       response.render('index', {encodedJson : encodeURIComponent(JSON.stringify(all_hospitals))})
});


// More info route
app.get('/moreInfo/:city&:hospitalName&:lat&:long', function(request, response){
  var latitude = request.params.lat;
  var longitude = request.params.long;
  var hospitalName = request.params.hospitalName;
  var city = request.params.city;
  var pharmacies = [];
  var abstract = ""

  sparql = require('sparql')

  // Query LinkGeoData
  linkGeoDataClient = new sparql.Client('http://linkedgeodata.org/sparql')
  linkGeoDataClient.query('Prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> Prefix ogc: <http://www.opengis.net/ont/geosparql#> Prefix geom: <http://geovocab.org/geometry#> Prefix lgdo: <http://linkedgeodata.org/ontology/> Select * From <http://linkedgeodata.org> { ?s a lgdo:Pharmacy ; rdfs:label ?l ; geom:geometry [ ogc:asWKT ?g ] .    Filter(bif:st_intersects (?g, bif:st_point (' + longitude + ', '+ latitude + '), 2)) . }', function(err, result) {
    for (var data in result.results.bindings) {
      var tmpPos = result.results.bindings[data].g.value;

      // Truc chelou des fois la position est en LINESTRING du coup on récupère que les bonnes position
      // TEST copier coller dans un navigateur : http://linkedgeodata.org/sparql?default-graph-uri=http%3A%2F%2Flinkedgeodata.org&query=Prefix+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E+Prefix+ogc%3A+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23%3E+Prefix+geom%3A+%3Chttp%3A%2F%2Fgeovocab.org%2Fgeometry%23%3E+Prefix+lgdo%3A+%3Chttp%3A%2F%2Flinkedgeodata.org%2Fontology%2F%3E+Select+*+From+%3Chttp%3A%2F%2Flinkedgeodata.org%3E+%7B+%3Fs+a+lgdo%3APharmacy+%3B+rdfs%3Alabel+%3Fl+%3B+geom%3Ageometry+%5B+ogc%3AasWKT+%3Fg+%5D+.++++Filter%28bif%3Ast_intersects+%28%3Fg%2C+bif%3Ast_point+%280.2355116754770279%2C+51.5428352355957%29%2C+3%29%29+.+%7D&format=text%2Fhtml&timeout=0&debug=on
      if (tmpPos.search("POINT\\(") != -1) {
        tmpPos = tmpPos.replace('POINT(', '').replace(')', '');
        var res = tmpPos.split(" ");
        var pharmacie = {name: result.results.bindings[data].l.value, latitude:res[1], longitude:res[0]};
        pharmacies.push(pharmacie);
      }
    }

    // Query Dbpedia
    dbpediaClient = new sparql.Client('http://dbpedia.org/sparql')
    dbpediaClient.query('SELECT ?type WHERE { dbr:' + city + ' dbo:abstract ?type. }', function(err, result) {
      if (result.results.bindings.length > 0) {
        abstract = result.results.bindings[0].type.value;
        response.render("moreInfo", {hospitalName: hospitalName, pharmacies: pharmacies, abstract: abstract});
      }
      response.render("moreInfo", {hospitalName: hospitalName, pharmacies: pharmacies});
    });
    
  });

  /*
  => Abstract du nom de la ville fait sur la query de dbpedia
  */

});

app.listen(3000)
