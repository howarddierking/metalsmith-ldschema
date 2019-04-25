const R = require('ramda');
// const jsonld = require('jsonld').promises;
const path = require('path');
// const { URL } = require('url');
// const P = require('bluebird');
// const rdf = require('rdflib');
const metalsmithFs = require('./fs');
const graph = require('./graph');

// metalsmithFromViewModel: Term -> [String, File]
const metalsmithFromViewModel = term => {
    const filename = path.basename(term.id) + '.html';
    const fileContents = {
        term,
        layout: 'layout.hbs',
        contents: Buffer.from('')
    };
    return [filename, fileContents];
};


// pipeline
// 1) files | pick rdf files | generate terms | add term files -> files
// 2) files | pick all non-rdf files -> files
const generateSite = R.curry(function(options, files, metalsmith, done){

  
    const rdfFiles = metalsmithFs.rdfFiles(files);
    graph.from(rdfFiles)
    .then(g => {
        const vm = graph.termsFor(g);

        // remove original rdf files

        // add a terms collection to each remaining file so that index pages, etc. can be created
        files = R.pipe(
            R.map(metalsmithFromViewModel), 
            R.fromPairs,
            R.mergeRight(files))(vm);
debugger;
        setImmediate(done);
    })
});

module.exports = generateSite;
