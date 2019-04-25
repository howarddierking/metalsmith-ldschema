const loader = require('./loader');
const termGenerator = require('./termGenerator');

module.exports = {
    rdfExtensions: loader.rdfExtensions,
    termsFor: termGenerator.termsFor,
    from: loader.from
}
