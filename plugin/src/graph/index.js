// const parseRdf = P.promisify(rdf.parse);

// const RDFS = rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');
// const RDF = rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
// const XSD = rdf.Namespace('http://www.w3.org/2001/XMLSchema#');
// const DC = rdf.Namespace('http://purl.org/dc/elements/1.1/');
// const SCHEMA_ORG = rdf.Namespace('http://schema.org/');

// (g, [k, v]) -> Promise(g) 
// const populateGraphFromFile = function(g, f){
//   let filename = first(f);
//   let fileinfo = second(f);

//   return parseRdf(
//     fileinfo.contents.toString('ascii'), 
//     g, 
//     `http://schema.howarddierking.com/${filename}`,   // what would this look like with multiple named graphs?
//     mediaType(filename));
// };

const rdfTypes = {
  '.jsonld': 'application/ld+json',
  '.ttl': 'text/turtle'
};

module.exports = {
	rdfTypes
}