'use strict';

const R = require('ramda');
const path = require('path');
const metalsmithFs = require('./fs');
const graph = require('./graph');

const DEFAULT_INDEX_FILE = 'index.html';
const DEFAULT_INDEX_LAYOUT = 'index.hbs';

// (Object, String) -> String
const DEFAULT_GET_LAYOUT = (options, typeName) => {
    const DEFAULT_LAYOUT = 'layout.hbs';
    const DEFAULT_CLASS_LAYOUT = 'class.hbs';
    const DEFAULT_PROPERTY_LAYOUT = 'property.hbs';

    if (typeName === graph.knownOntologies.RDFS('Class').value) {
        return R.defaultTo(DEFAULT_CLASS_LAYOUT, options.classLayout);
    }
    if (typeName === graph.knownOntologies.RDF('Property').value) {
        return R.defaultTo(DEFAULT_PROPERTY_LAYOUT, options.propertyLayout);
    }
    return DEFAULT_LAYOUT;
};

// a-> Boolean
const DEFAULT_IS_CLASS = R.pathEq(['type', [0]], graph.knownOntologies.RDFS('Class').value);

// metalsmithFileFromViewModel: (String -> String) -> Term -> [String, File]
const metalsmithFileFromViewModel = R.curry((options, getLayout, term) => {
    const filename = `${path.basename(term.id[0])}.html`;
    const fileContents = {
        base: options.base,
        term,
        layout: getLayout(options, term.type[0]),
        contents: Buffer.from('')
    };

    return [filename, fileContents];
});

// pipeline
// 1) files | pick rdf files | generate terms | add term files -> files
// 2) files | pick all non-rdf files -> files
const generateSite = R.curry((options, files, metalsmith, done) => {
    const getLayout = R.defaultTo(DEFAULT_GET_LAYOUT, options.getLayout);
    const rdfFiles = metalsmithFs.rdfFiles(files);

    graph.from(rdfFiles).then(g => {
        const vm = graph.termsFor(g, options.query, options.base);

        // add a terms collection to each remaining file so that index pages, etc. can be created
        const termFiles = R.pipe(
            R.map(metalsmithFileFromViewModel(options, getLayout)),
            R.fromPairs
        )(vm);

        // add termFiles to files
        R.forEachObjIndexed((value, key) => {
            files[key] = value; // eslint-disable-line no-param-reassign
        }, termFiles);

        const isClass = R.defaultTo(DEFAULT_IS_CLASS, options.isClass);

        // add index to files
        // eslint-disable-next-line no-param-reassign
        files[DEFAULT_INDEX_FILE] = {
            base: options.base,
            classes: R.filter(isClass, vm),
            layout: DEFAULT_INDEX_LAYOUT,
            contents: Buffer.from('')
        };

        setImmediate(done);
    });
});

module.exports = generateSite;
