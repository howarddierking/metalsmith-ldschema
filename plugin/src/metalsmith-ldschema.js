const R = require('ramda');
const jsonld = require('jsonld').promises;
const path = require('path');
const url = require('url');
const P = require('bluebird');
const rdf = require('rdflib');
const fs = require('fs');
const RDFS = rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');
const RDF = rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const XSD = rdf.Namespace('http://www.w3.org/2001/XMLSchema#');
const DC = rdf.Namespace('http://purl.org/dc/elements/1.1/');
const SCHEMA_ORG = rdf.Namespace('http://schema.org/');

const first = R.nth(0);
const second = R.nth(1);

const hasFileExtension =  R.curry(function(ext, fileName){
  return path.extname(fileName) === ext;
});

const isRdf = R.anyPass([hasFileExtension('.jsonld'), hasFileExtension('.ttl')]);

// // String -> Object
// const createRemoteTermStub = function(id){
//   return {
//     id: id,
//     label: id,
//     comment: 'Remote term',
//     path: id
//   };
// };

// const createClass = function(node){
//   return {
//     parentClasses: [],
//     childClasses: [],
//     properties: [],
//     valueFor: []
//   }
// };

// const createProperty = function(node){
//   return {
//     usedOn: [],
//     expectedTypes: []
//   }
// };

// // n -> t
// const createTerm = function(node){
//   if(R.complement(isValidTerm)(node)){
//     debugger;
//     throw new Error('Node must be an rdfs:Class or rdf:Property');
//   }

//   let term = R.ifElse(isClass, createClass, createProperty)(node);
//   term._source = node;
//   term.id = id(node);
//   term.label = firstValue(rdfsFullName('label'), node); // TODO: make functions for these accessors
//   term.comment = firstValue(rdfsFullName('comment'), node);
//   term.lastPathSegment = lastPathSegment(term.id);
//   term.path = '/' + term.lastPathSegment;
//   term.fileName = term.lastPathSegment + '.html';

//   return term;
// };

// const createPages = R.curry(function(files, options, linkedTerms){
//   R.forEach(t => {
//     let outputFile = {
//       term: t,
//       contents: new Buffer(''),
//       layout: isClass(t._source) ? options.classLayout : options.propertyLayout
//     };

//     files[t.fileName] = outputFile;
//   }, R.values(linkedTerms));
// });


const generateSite = R.curry(function(options, files, metalsmith, done){
  if(R.isNil(options))
    done(new TypeError('options is required.'));
  if(R.isNil(options.classLayout))
    done(new TypeError('options.classLayout is required.'));
  if(R.isNil(options.propertyLayout))
    done(new TypeError('options.propertyLayout is required.'));

  // TODO: allow for some configuration here whereby the user can supply a specific list of files or possibly even a selection function
  // TODO: try and make this more expressive - finding that transparent use of functions like pipe and nthArg hurt the ability to reason about the data types
  let selectedFiles = R.pickBy(R.pipe(R.nthArg(1), isRdf), files);

  let graph = rdf.graph();

  // just parse the first one to see what that looks like
  // TODO: need to see what it looks like with multiple graphs - also, what should the level of control be for the user creating the graph IRI
  firstSelectedFile = first(R.values(selectedFiles));

  console.info('pre');
  console.info(firstSelectedFile.contents.toString('ascii'));

  // TODO: investigate the best way to go about parsing the file - ideally should switch encoding to utf8 and process the buffer directly
  rdf.parse(
    firstSelectedFile.contents.toString('ascii'), 
    graph, 
    'http://schema.howarddierking.com/bug.ttl', 
    'text/turtle');

  // render pages for all the classes
  let classes = graph.each(undefined, RDF('type'), RDFS('Class'));

    console.info('post');

  // render pages for all the properties
  let properites = graph.each(undefined, RDF('type'), RDFS('Class'))
    

  // R.pipeP(extractTerms, linkTerms, createPages(files, options), done)(R.values(selectedFiles));

  /**
   * Data contract for pages
   * 
   * Common: (there's probably room for cleanup here)
   * - id: String
   * - label: String
   * - comment: String
   * - lastPathSegment: String
   * - path: String
   * - fileName: String
   * 
   * Class:
   * - parentClasses: []
   * - childClasses: []
   * - properties: []
   * - valueFor: [] 
   * 
   * Property: 
   * - usedOn: []
   * - expectedTypes: []
   * 
   */
  
});







// TODO: assign generateSite directly to module exports as currying should take care of returning the right functional signature
module.exports = function(options){
  return generateSite(options);
};

