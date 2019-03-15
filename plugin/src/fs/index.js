const path = require('path');
const R = require('ramda');
const Rx = require('../ramdaExt');
const graph = require('../graph');

// [String] -> * -> Boolean
const hasFileExtension = R.curry(function(extensions, file){
  let ext = path.extname(file);
  return R.contains(ext, extensions);
});

// const fileExtension = R.curry(path.extname);

// const mediaType = R.pipe(fileExtension, R.prop(R.__, rdfTypes));

// [String, Object] -> Boolean
// I don't like this - predicate should be simpler to be more generic - (String -> Boolean)
const isRdf = R.pipe(Rx.first, hasFileExtension(R.keys(graph.rdfTypes)));

const isRdfFile = hasFileExtension(R.keys(graph.rdfTypes));
// const pathSegments = R.split('/');

// const lastPathSegment = function(iri){ 
//   return R.last(pathSegments(new URL(iri).pathname));
// };

// const termFile = function(iri){
//   return `${lastPathSegment(iri)}.html`;
// };

// [String] -> [String]
const rdfFiles = R.filter(isRdfFile);



module.exports = {
	rdfFiles
}