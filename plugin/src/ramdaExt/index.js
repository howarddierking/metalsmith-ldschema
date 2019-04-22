const R = require('ramda');

/**************************
* IDEAS
* 
* paths: [[p]] -> Object -> [v | Undefined]
* 
**************************/

const first = R.nth(0);
const second = R.nth(1);

const isNotNil = R.complement(R.isNil);

const throwException = (message) => {
    return function(){
        throw new Error(message);
    }
}

// containsID: v -> {k: v} -> Boolean
const containsID = (val, o) => {
    debugger;
    let ret = R.any(
        R.propEq('id', R.prop('id', val)),
        o);
    return ret;
};

// safeIncludesWith: (a → [a] → Boolean) -> a -> [a] -> Boolean
const safeIncludesWith = R.curry((includes, item, list) => {
    return isNotNil(item) && isNotNil(list) && includes(item, list);
});

// safeIncludes: a -> [a] -> Boolean
const safeIncludes = safeIncludesWith(R.includes);

// uniqueAppend: a -> [a] -> [a]
const uniqueAppend = R.ifElse(
    safeIncludes, 
    R.nthArg(1), 
    R.append);

// uniqueAppendWith: (a → [a] → Boolean) -> a -> [a] -> [a]
const uniqueAppendWith = R.ifElse(
    safeIncludesWith, 
    R.nthArg(2), 
    R.append);

module.exports = {
	first,
	second,
    throw: throwException,
    uniqueAppend,
    uniqueAppendWith,
    safeIncludes,
    safeIncludesWith
}
