const rdf = require('rdflib');
const fs = require('fs');
const bluebird = require('bluebird');
const path = require('path');

const readFile = bluebird.promisify(fs.readFile);
const demoTurtleFile = path.resolve(__dirname, './src/bug.ttl');
const MYSCHEMA = rdf.Namespace('http://schema.howarddierking.com/');
const RDFS = rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');

let graph = rdf.graph();

readFile(demoTurtleFile, {encoding: 'ascii'})
  .then(function(data){
    rdf.parse(data, graph, 'http://schema.howarddierking.com/bug.ttl', 'text/turtle');
    let c = graph.any(MYSCHEMA('Bug'), RDFS('comment'), undefined);

  })

