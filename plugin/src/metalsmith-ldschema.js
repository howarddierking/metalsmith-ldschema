const R = require('ramda');
const jsonld = require('jsonld').promises;
const path = require('path');
const { URL } = require('url');
const P = require('bluebird');
const rdf = require('rdflib');
const fs = require('fs');

const parseRdf = P.promisify(rdf.parse);

const RDFS = rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');
const RDF = rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const XSD = rdf.Namespace('http://www.w3.org/2001/XMLSchema#');
const DC = rdf.Namespace('http://purl.org/dc/elements/1.1/');
const SCHEMA_ORG = rdf.Namespace('http://schema.org/');

const first = R.nth(0);
const second = R.nth(1);

const rdfTypes = {
  '.jsonld': 'application/ld+json',
  '.ttl': 'text/turtle'
};

const hasFileExtension = R.curry(function(extensions, file){
  let ext = path.extname(file);
  return R.contains(ext, extensions);
});

const fileExtension = R.curry(path.extname);

const mediaType = R.pipe(fileExtension, R.prop(R.__, rdfTypes));

const isRdf = hasFileExtension(R.keys(rdfTypes));

const pathSegments = R.split('/');

const lastPathSegment = function(iri){ 
  return R.last(pathSegments(new URL(iri).pathname));
};

const termFile = function(iri){
  return `${lastPathSegment(iri)}.html`;
}

// (g, [k, v]) -> Promise(g) 
const populateGraphFromFile = function(g, f){
  let filename = first(f);
  let fileinfo = second(f);

  return parseRdf(
    fileinfo.contents.toString('ascii'), 
    g, 
    `http://schema.howarddierking.com/${filename}`,   // what would this look like with multiple named graphs?
    mediaType(filename));
};

// g -> n -> [id, term]
const createTermTuple = R.curry(function(graph, pathResolver, n){
  return [n.value, 
    {
      id: n.value,
      label: graph.any(n, RDFS('label'), undefined).value,
      comment: graph.any(n, RDFS('comment'), undefined).value,
      path: pathResolver(n.value)
    }];
});

// naive implementation
// TODO: more extensive version to deal with relative IRIs
const termPath = R.curry(function(base, iri){
  if(base && iri.startsWith(base))
    return new URL(iri).pathname;
  return iri;
});

const generateSite = R.curry(function(options, files, metalsmith, done){
  if(R.isNil(options))
    done(new TypeError('options is required.'));
  if(R.isNil(options.classLayout))
    done(new TypeError('options.classLayout is required.'));
  if(R.isNil(options.propertyLayout))
    done(new TypeError('options.propertyLayout is required.'));
  let termPathResolver = termPath(options.base);

  // TODO: ensure that _any_ place where there's not a match to an existing term can be listed as the IRI
  
  // {filename, content} -> R.pickBy(val, key) -> pick(key) -> isRdf
  // TODO: would the code be more straightforward to reason about if the object was just converted to pairs??
  let selectedFiles = R.pickBy(R.pipe(R.nthArg(1), isRdf), files);

  P.reduce(R.toPairs(selectedFiles), populateGraphFromFile, rdf.graph())
    .then(function(graph){
      //
      // pass 1 - create all termInfo objects
      //
      let classes = graph.each(undefined, RDF('type'), RDFS('Class'));
      let properties = graph.each(undefined, RDF('type'), RDF('Property'))

      let termCreator = createTermTuple(graph, termPathResolver);

      let classTerms = R.fromPairs(R.map(R.pipe(termCreator), classes));
      let propertyTerms = R.fromPairs(R.map(termCreator, properties));


      //
      // pass 2 - link term info objects by iterating classes
      //
      R.forEachObjIndexed((v, k) => {
        let term = classTerms[v.value];
        term.parentClasses = [];
        term.childClasses = [];
        term.properties = [];
        term.valueFor = [];

        // class::parentClasses
        let parentClasses = graph.each(v, RDFS('subClassOf'), undefined);
        R.forEach(n => {
          term.parentClasses.push(classTerms[n.value]);
        }, parentClasses);

        // class::childClasses
        let childClasses = graph.each(undefined, RDFS('subClassOf'), v);
        R.forEach(n => {
          term.childClasses.push(classTerms[n.value]);
        }, childClasses);

        // class::properties + property::usedOn
        let properties = graph.each(undefined, SCHEMA_ORG('domainIncludes'), v);
        R.forEach(n => {
          propertyTerm = propertyTerms[n.value];
          if(!propertyTerm.usedOn)
            propertyTerm.usedOn = [];

          // add to class::properties
          term.properties.push(propertyTerm)

          // add to property::usedOn
          propertyTerm.usedOn.push(term);

          // write the term file
          files[termFile(term.id)] = {
            term: term,
            contents: new Buffer(''),
            layout: options.classLayout
          }
        }, properties);
      }, classes);

      R.forEachObjIndexed((v, k) => {
        let term = propertyTerms[v.value];
        term.expectedTypes = [];

        // property::expectedTypes + class::valueFor
        let types = graph.each(v, SCHEMA_ORG('rangeIncludes'), undefined);
        R.forEach(n => {
          classTerm = classTerms[n.value];

          // add to property::expectedTypes
          term.expectedTypes.push(R.defaultTo({ id: n.value, label: n.value, path: termPathResolver(n.value) }, classTerm));

          // add to class::valueFor
          if(classTerm){
            classTerm.valueFor.push(term);
          }
        }, types);

        // write the term file
        files[termFile(term.id)] = {
          term: term,
          contents: new Buffer(''),
          layout: options.propertyLayout
        }
      }, properties);


      setImmediate(done);
    });
});

module.exports = function(options){
  return generateSite(options);
};