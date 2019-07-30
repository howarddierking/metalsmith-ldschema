'use strict';

const R = require('ramda');
const Rx = require('../ramdaExt');

const concatUnique = (k, l, r) => {
    // TODO: depending on how this were to end up being used, may want to
    // pivot merging algorithm based on the key (e.g. in cases where the
    // value should always be scalar)
    if (R.equals(l, r)) return l;
    return R.union(l, r);
};

// termForBinding: [k,v] -> [k,v]
const termForBinding = p => [
    R.slice(1, Infinity, Rx.first(p)), // remove '?' from SPARQL parameters
    [R.prop('value', Rx.second(p))]
];

const termForBindingGroup = bindingGroup => {
    if (bindingGroup.length === 0) return {};

    const head = R.head(bindingGroup);
    const term = R.pipe(
        R.toPairs,
        R.map(termForBinding),
        R.fromPairs
    )(head);

    return R.mergeWithKey(concatUnique, term, termForBindingGroup(R.tail(bindingGroup)));
};

const termsFrom = R.pipe(
    R.groupBy(R.path(['?id', 'value'])),
    R.values,
    R.map(termForBindingGroup)
);

module.exports = {
    termsFrom,
    termForBindingGroup,
    termForBinding
};
