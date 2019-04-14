const path = require('path');
const R = require('ramda');
const Rx = require('../ramdaExt');
const graph = require('../graph');

// [String] -> String -> Boolean
// const hasFileExtension = R.curry(function(extensions, f){
//   let ext = path.extname(f);
//   return R.contains(ext, extensions);
// });

// const fileExtension = R.curry(path.extname);

// const mediaType = R.pipe(fileExtension, R.prop(R.__, rdfTypes));

// [String, Object] -> Boolean
// I don't like this - predicate should be simpler to be more generic - (String -> Boolean)
// 20190315: as this module is going to focus more on the metalsmith file structure, we should 
//    change this contract to accept (v, k) as this is consistent with the metalsmith files object
// const isRdf = R.pipe(Rx.first, hasFileExtension());

// (v, k) -> Boolean
// const isRdf = hasFileExtension(graph.rdfExtensions);

const isRdf = R.ifElse(R.isNil, 
    R.always(false), 
    R.pipe(
        path.extname, 
        R.includes(R.__, graph.rdfExtensions)));

// const pathSegments = R.split('/');

// const lastPathSegment = function(iri){ 
//   return R.last(pathSegments(new URL(iri).pathname));
// };

// const termFile = function(iri){
//   return `${lastPathSegment(iri)}.html`;
// };

// [String] -> [String]
// const rdfFiles = R.filter(isRdfFile);

// {k: v} -> {k: v}
const rdfFiles = R.pickBy(R.pipe(
    R.nthArg(1), 
    isRdf));

// {f: {k: v}} -> {f: v}
const filePairs = R.map(v => v.contents);

module.exports = {
    isRdf,
    rdfFiles,
    filePairs
};
