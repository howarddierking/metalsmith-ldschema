const R = require('ramda');
// const jsonld = require('jsonld').promises;
// const path = require('path');
// const { URL } = require('url');
// const P = require('bluebird');
// const rdf = require('rdflib');
const metalsmithFs = require('./fs');





// pipeline
// 1) files | pick rdf files | generate terms | add term files -> files
// 2) files | pick all non-rdf files -> files
const generateSite = R.curry(function(options, files, metalsmith, done){

debugger;

  const terms = R.pipe(
    metalsmithFs.rdfFiles,
    graph.from
    graph.terms)(files);



debugger;
  // const terms = R.pipe(R.pick(rdfFiles), graph.fromFiles, gen.generateTerms);

  // remove original rdf files

  // add a terms collection to each remaining file so that index pages, etc. can be created

  // write a new file for each term
  // files[termFile(term.id)] = {
  //   term: term,
  //   contents: new Buffer(''),
  //   layout: options.classLayout
  // }
  setImmediate(done);
});

module.exports = generateSite;
