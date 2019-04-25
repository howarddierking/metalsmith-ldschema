const R = require('ramda');
const rdf = require('rdflib');
const P = require('bluebird');
const path = require('path');
const Rx = require('../ramdaExt');

const parseRdf = P.promisify(rdf.parse);

const rdfTypes = {
  '.jsonld': 'application/ld+json',
  '.ttl': 'text/turtle'
};

// Graph, [String, Object] -> Promise Graph
const appendGraph = (accum, val) => {
    const filename = Rx.first(val);
    const fileinfo = Rx.second(val);

    return parseRdf(
        fileinfo.contents.toString('ascii'), 
        accum,
        `http://schema.howarddierking.com/${filename}`, // <-- TODO
        mediaType(filename));
};

// TODO: try to convert to expression based on the below
// {k: v} -> Promise Graph
const from = (files) => {
    return P.reduce(R.toPairs(files), appendGraph, rdf.graph());
}

// String -> String 
const mediaType = R.pipe(
    path.extname, 
    R.prop(R.__, rdfTypes),
    R.when(R.isNil, Rx.throw(`No media type found for extension.`)));


module.exports = {
    rdfExtensions: R.keys(rdfTypes),
    mediaType,
    from
}
