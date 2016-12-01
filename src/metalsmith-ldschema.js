const R = require('ramda');
const jsonld = require('jsonld').promises;
const path = require('path');
const url = require('url');
const P = require('bluebird');

const first = R.nth(0);
const second = R.nth(1);

const hasFileExtension =  R.curry(function(ext, fileName){
  return path.extname(fileName) === ext;
});

const isJsonLd = hasFileExtension('.jsonld');
const pathSegments = R.split('/');
const lastPathSegment = R.pipe(url.parse, R.prop('pathname'), pathSegments, R.last);
const rdfsFullName = R.concat('http://www.w3.org/2000/01/rdf-schema#');
const rdfFullName = R.concat('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const xsdFullName = R.concat('http://www.w3.org/2001/XMLSchema#');
const dcFullName = R.concat('http://purl.org/dc/elements/1.1/');
const concurFullName = R.concat('http://schema.concursolutions.com/');
const schemaOrgFullName = R.concat('http://schema.org/');

// {'@type': [String]} -> String
const type = R.pipe(R.prop('@type'), first);

// Object -> Boolean
const isClass =  R.pipe(type, R.equals(rdfsFullName('Class')));

// Object -> Boolean
const isProperty = R.pipe(type, R.equals(rdfFullName('Property')));

// n -> Boolean
const isValidTerm = R.either(isClass, isProperty);

const firstValue = R.pipe(R.prop, first, R.prop('@value'));

const id = R.prop('@id');

// a -> a | []
const defaultToEmptyArray = R.defaultTo([]);

// Object -> [Object]
const subClassOf = R.pipe(R.prop(rdfsFullName('subClassOf')), defaultToEmptyArray);

// Object -> [Object]
const domainIncludes = defaultToEmptyArray(R.prop(schemaOrgFullName('domainIncludes')));

// Object -> [Object]
const rangeIncludes = defaultToEmptyArray(R.prop(schemaOrgFullName('rangeIncludes')));

const localLookup = R.curry(function(source, id){
  return source[id];
});

// a -> t -> {i: t}
const  hashTermyId = function(accumulator, term){
  accumulator[term.id] = term;
  return accumulator;
};

// (* -> Object) -> (* -> Object) -> String -> Object
const getLinkedTerm = R.curry(function(finder, creator, id){
  let r = finder(id);
  return r || creator(id);
});

// String -> Object
const createRemoteTermStub = function(id){
  return {
    id: id,
    label: id,
    comment: 'Remote term',
    path: id
  };
};

const createClass = function(node){
  return {
    parentClasses: [],
    childClasses: [],
    properties: [],
    valueFor: []
  }
};

const createProperty = function(node){
  return {
    usedOn: [],
    expectedTypes: []
  }
};

// n -> t
const createTerm = function(node){
  if(R.complement(isValidTerm)(node)){
    debugger;
    throw new Error('Node must be an rdfs:Class or rdf:Property');
  }

  let term = R.ifElse(isClass, createClass, createProperty)(node);
  term._source = node;
  term.id = id(node);
  term.label = firstValue(rdfsFullName('label'), node); // TODO: make functions for these accessors
  term.comment = firstValue(rdfsFullName('comment'), node);
  term.lastPathSegment = lastPathSegment(term.id);
  term.path = '/' + term.lastPathSegment;
  term.fileName = term.lastPathSegment + '.html';

  return term;
};

// [f] -> Promise Object
const extractTerms = function(rdfDocuments){
  return P.reduce(rdfDocuments, (acc, file) => {
    let data = JSON.parse(file.contents.toString());
    return jsonld.flatten(data)
      .then(nodes => {
        let terms = R.map(createTerm, nodes);
        let indexedTerms = R.reduce(hashTermyId, {}, terms);
        return R.merge(acc, indexedTerms);
      });
  }, {});
}

const associateTerms = R.curry(function(termResolver, termProperty, linkedTermProperty, termValueSelector, term){
  if(R.has(termProperty, term)){
    let sourceValues =  termValueSelector(term._source);
    R.forEach(v => {
      // get the linked term
      let linkedTerm = termResolver(id(v));

      // bind (2 way)
      // NOTE: assumes that association properties are arrays
      term[termProperty].push(linkedTerm);
      if(R.has(linkedTermProperty, linkedTerm))
        linkedTerm[linkedTermProperty].push(term);
    }, sourceValues);
  }
});

// Object -> Promise Object
const linkTerms = function(terms){
  let resolveTerm = getLinkedTerm(localLookup(terms), createRemoteTermStub);
  let associate = associateTerms(resolveTerm);

  return R.map(t => {
    associate('parentClasses', 'childClasses', subClassOf, t);
    associate('usedOn', 'properties', domainIncludes, t);
    associate('expectedTypes', 'valueFor', rangeIncludes, t);

    return t;
  }, terms);
};

const createPages = R.curry(function(files, options, linkedTerms){
  R.forEach(t => {
    let outputFile = {
      term: t,
      contents: new Buffer(''),
      layout: isClass(t._source) ? options.classLayout : options.propertyLayout
    };

    files[t.fileName] = outputFile;
  }, R.values(linkedTerms));
});


const generateJsonLdSite = R.curry(function(options, files, metalsmith, done){
  if(R.isNil(options))
    done(new TypeError('options is required.'));
  if(R.isNil(options.classLayout))
    done(new TypeError('options.classLayout is required.'));
  if(R.isNil(options.propertyLayout))
    done(new TypeError('options.propertyLayout is required.'));

  // TODO: allow for some configuration here whereby the user can supply a specific list of files or possibly even a selection function
  let selectedFiles = R.pickBy(R.pipe(R.nthArg(1), isJsonLd), files);

  R.pipeP(extractTerms, linkTerms, createPages(files, options), done)(R.values(selectedFiles));
});

module.exports = function(options){
  return generateJsonLdSite(options);
};
