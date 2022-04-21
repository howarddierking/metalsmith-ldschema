import * as R from 'ramda';

/** ************************
 * IDEAS
 *
 * paths: [[p]] -> Object -> [v | Undefined]
 *
 ************************* */

const first = R.nth(0);
const second = R.nth(1);

const isNotNil = R.complement(R.isNil);

const defaultList = R.defaultTo([]);

// prettier-ignore
const throwException = message => function throwEx() {
        throw new Error(message);
    };

// TODO: refactor to expression
// uniqueAppendWith: (a → [a] → Boolean) -> a -> [a] -> [a]
const uniqueAppendWith = R.curry((includes, item, list) => {
    const l = defaultList(list);
    if (isNotNil(item) && !R.any(includes(item), l)) {
        return R.append(item, l);
    }
    return l;
});

// uniqueAppend: a -> [a] -> [a]
const uniqueAppend = uniqueAppendWith(R.equals);

export {
    first,
    second,
    throwException as throw,
    uniqueAppend,
    uniqueAppendWith
};
