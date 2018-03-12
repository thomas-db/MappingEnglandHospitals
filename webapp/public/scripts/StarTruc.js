function truc() {
    require(['node_modules/stardog/dist/stardog.js'], function(stardog) {
      const conn = new stardog.Connection({
      username: 'admin',
      password: 'admin',
      endpoint: 'http://localhost:5820',
    });
    stardog.query.execute(conn, 'HeTanPresident', 'select distinct ?s where { ?s ?p ?o } limit 2', {
    }).then(({ body }) => {
      console.log(body.results.bindings);
    });


      console.log('stardog is loaded');
    });
    console.log("meh");
    console.log('bitoku');
}
