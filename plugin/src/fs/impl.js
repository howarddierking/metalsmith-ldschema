'use strict';

const path = require('path');
const R = require('ramda');
const graph = require('../graph');

const isRdf = R.ifElse(
    R.isNil,
    R.always(false),
    R.pipe(
        path.extname,
        R.includes(R.__, graph.rdfExtensions)
    )
);

// {k: v} -> {k: v}
const rdfFiles = R.pickBy(
    R.pipe(
        R.nthArg(1),
        isRdf
    )
);

// {f: {k: v}} -> {f: v}
const filePairs = R.map(v => v.contents);

module.exports = {
    isRdf,
    rdfFiles,
    filePairs
};
