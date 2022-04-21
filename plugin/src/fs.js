import * as path from 'path';
import * as R from 'ramda';

const rdfTypes = {
    '.jsonld': 'application/ld+json',
    '.ttl': 'text/turtle',
    '.owl': 'text/turtle'
};

// TODO: is this still necessary or can we use the native functionality in rdf-parse?
const isRdf = R.ifElse(
    R.isNil,
    R.always(false),
    R.pipe(
        path.extname,
        R.includes(R.__, R.keys(rdfTypes))
    )
);

// {k: v} -> {k: v}
const getRdfFiles = R.pickBy(
    R.pipe(
        R.nthArg(1),
        isRdf
    )
);

// {f: {k: v}} -> {f: v}
const filePairs = R.map(v => v.contents);

export {
    isRdf,
    getRdfFiles,
    filePairs
};
