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

// layout: Object -> String -> String
const getLayout = R.curry((options, typeName) => {
    if (typeName === graph.knownOntologies.RDFS('Class').value) {
        return R.defaultTo(DEFAULT_CLASS_LAYOUT, options.classLayout);
    }
    if (typeName === graph.knownOntologies.RDF('Property').value) {
        return R.defaultTo(DEFAULT_PROPERTY_LAYOUT, options.propertyLayout);
    }
    return DEFAULT_LAYOUT;
});

// metalsmithFileFromViewModel: (String -> String) -> Term -> [String, File]
const metalsmithFileFromViewModel = R.curry((layout, term) => {
    const filename = `${path.basename(term.id[0])}.html`;
    const fileContents = {
        term,
        layout: layout(term.type[0]),
        contents: Buffer.from('')
    };

    return [filename, fileContents];
});

// pipeline
// 1) files | pick rdf files | generate terms | add term files -> files
// 2) files | pick all non-rdf files -> files
const generateSite = R.curry((options, files, metalsmith, done) => {
    const layout = getLayout(options);
    const rdfFiles = metalsmithFs.rdfFiles(files);
    graph.from(rdfFiles).then(g => {
        const vm = graph.termsFor(g, options.query, options.base);

        // add a terms collection to each remaining file so that index pages, etc. can be created
        const termFiles = R.pipe(
            R.map(metalsmithFileFromViewModel(layout)),
            R.fromPairs
        )(vm);

        // add termFiles to files
        R.forEachObjIndexed((value, key) => {
            files[key] = value; // eslint-disable-line no-param-reassign
        }, termFiles);

        // add index to files
        // eslint-disable-next-line no-param-reassign
        files[DEFAULT_INDEX_FILE] = {
            classes: R.filter(
                R.pathEq(['type', [0]], graph.knownOntologies.RDFS('Class').value),
                vm
            ),
            layout: DEFAULT_INDEX_LAYOUT,
            contents: Buffer.from('')
        };

        setImmediate(done);
    });
});

module.exports = generateSite;
