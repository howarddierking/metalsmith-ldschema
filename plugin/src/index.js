'use strict';

const R = require('ramda');
const path = require('path');
const metalsmithFs = require('./fs');
const graph = require('./graph');

// TODO: get from config
const DEFAULT_INDEX_FILE = 'index.html';
const DEFAULT_INDEX_LAYOUT = 'index.hbs';
const DEFAULT_LAYOUT = 'layout.hbs';
const DEFAULT_CLASS_LAYOUT = 'class.hbs';
const DEFAULT_PROPERTY_LAYOUT = 'property.hbs';

const layoutOrDefault = R.defaultTo(DEFAULT_LAYOUT);

// metalsmithFileFromViewModel: Options -> Term -> [String, File]
const metalsmithFileFromViewModel = R.curry((options, term) => {
    const layoutMap = {
        class: R.defaultTo(DEFAULT_CLASS_LAYOUT, options.classLayout),
        property: R.defaultTo(DEFAULT_PROPERTY_LAYOUT, options.propertyLayout)
    };

    const filename = `${path.basename(term.id)}.html`;
    const fileContents = {
        term,
        layout: layoutOrDefault(R.prop(term.type, layoutMap)),
        contents: Buffer.from('')
    };
    return [filename, fileContents];
});

// pipeline
// 1) files | pick rdf files | generate terms | add term files -> files
// 2) files | pick all non-rdf files -> files
const generateSite = R.curry((options, files, metalsmith, done) => {
    const rdfFiles = metalsmithFs.rdfFiles(files);
    graph.from(rdfFiles).then(g => {
        const vm = graph.termsFor(g, options.base);

        // TODO: remove original rdf files

        // add a terms collection to each remaining file so that index pages, etc. can be created
        const termFiles = R.pipe(
            R.map(metalsmithFileFromViewModel(options)),
            R.fromPairs
        )(vm);

        // add termFiles to files
        R.forEachObjIndexed((value, key) => {
            files[key] = value; // eslint-disable-line no-param-reassign
        }, termFiles);

        // add index to files
        // eslint-disable-next-line no-param-reassign
        files[DEFAULT_INDEX_FILE] = {
            classes: R.filter(R.propEq('type', 'class'), vm),
            layout: DEFAULT_INDEX_LAYOUT,
            contents: Buffer.from('')
        };

        setImmediate(done);
    });
});

module.exports = generateSite;
