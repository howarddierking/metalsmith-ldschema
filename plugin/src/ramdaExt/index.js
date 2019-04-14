const R = require('ramda');

/**************************
* IDEAS
* 
* paths: [[p]] -> Object -> [v | Undefined]
* 
**************************/

const first = R.nth(0);
const second = R.nth(1);

const throwException = (message) => {
    return function(){
        throw new Error(message);
    }
}

// a -> [a] -> Boolean
const safeIncludes = R.ifElse(
    R.anyPass([
        R.pipe(R.nthArg(0), R.isNil), 
        R.pipe(R.nthArg(1), R.isNil)]),
    R.F,
    R.includes);
    

// uniqueAppend: a -> [a] -> [a]
const uniqueAppend = R.ifElse(
    safeIncludes, 
    R.nthArg(1), 
    R.append);

module.exports = {
	first,
	second,
    throw: throwException,
    uniqueAppend,
    safeIncludes
}
