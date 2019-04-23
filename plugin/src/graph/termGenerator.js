const R = require('ramda');
const Rx = require('../ramdaExt');
const rdf = require('rdflib');
const P = require('bluebird');

const RDFS = rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');
const RDF = rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const XSD = rdf.Namespace('http://www.w3.org/2001/XMLSchema#');
const DC = rdf.Namespace('http://purl.org/dc/elements/1.1/');
const SCHEMA_ORG = rdf.Namespace('http://schema.org/');

const QB_TERM = '?term';
const QB_TYPE = '?type';
const QB_LABEL = '?label';
const QB_COMMENT = '?comment';
const QB_PROPERTY = '?property';
const QB_DOMAIN = '?domain';
const QB_RANGE = '?range';

const DEFAULT_UNKNOWN = '(unknown)';

const termsQuery = `prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 

select ?term ?type ?label ?comment
where 
{ 
    ?term rdf:type ?type ;
        rdfs:label ?label .
    OPTIONAL { ?term rdfs:comment ?comment . } 
}`;

const propertiesQuery = `prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 

select ?property ?domain ?range
where 
{ 
    ?property rdf:type rdf:Property;  
        rdfs:domain ?domain;
        rdfs:range ?range .
}`;

// String -> 'class' | 'property' | '(unknown)'
// TODO: test 'unknown' case
const friendlyTypeName = R.cond([
        [R.equals(RDFS('Class').value), R.always('class')],
        [R.equals(RDF('Property').value), R.always('property')],
        [R.T, R.always(DEFAULT_UNKNOWN)]
    ]);

const termFromQueryBinding = (qb) => {
    return {
        id: qb[QB_TERM].value,
        type: friendlyTypeName(qb[QB_TYPE].value),
        label: qb[QB_LABEL].value,
        comment: R.path([QB_COMMENT, 'value'], qb)
    }
};

const proxyTerm = (id) => {
    return {
        id,
        type: 'proxy'
    }
};

// termOrProxy: String -> TermMap -> Term
const termOrProxy = R.ifElse(
    R.has,
    R.prop,
    proxyTerm);


// containsID: {k: v} -> {k: v} -> Boolean
const containsID = R.eqProps('id');

// uniqueAppendById: a -> [a] -> [a]
const uniqueAppendById = Rx.uniqueAppendWith(containsID);


// NOTE: This section intentionally mutates the term map. The more pure approach
//       would involve producing multiple term maps - 1 for each domain/range 
//       row - and then merge them all back together to produce a final map. 
//       For this particular application, such an approach seems unnecessary
//       in both complexity and in memory consumption
const domainAndRangeBinder = R.curry((termMap, qb) => {
    const property = termOrProxy(qb[QB_PROPERTY].value, termMap);
    const domainClass = termOrProxy(qb[QB_DOMAIN].value, termMap);
    const rangeClass = termOrProxy(qb[QB_RANGE].value, termMap);

    // domain
    property.usedOn = uniqueAppendById(domainClass, property.usedOn);
    domainClass.properties = uniqueAppendById(property, domainClass.properties);
    
    // range
    property.expectedTypes = uniqueAppendById(rangeClass, property.expectedTypes);
    rangeClass.valueFor = uniqueAppendById(property, rangeClass.valueFor);
});

// Graph -> [TermViewModel]
const generateViewModel = (g) => {
    // get terms
    const tq = rdf.SPARQLToQuery(termsQuery, false, g);
    const tqBindings = g.querySync(tq);

    // index terms by id for faster relationship binding
    const termMap = R.pipe(
        R.map(termFromQueryBinding), 
        R.indexBy(R.prop('id')))(tqBindings);

    // bind properties (domain and range)
    const pq = rdf.SPARQLToQuery(propertiesQuery, false, g);
    const pqBindings = g.querySync(pq);

    R.forEach(domainAndRangeBinder(termMap), pqBindings);

    // NO NO NO NO NO NO  
    //  this would result in an O(n^2) complexity because of having to 
    //  iterate pqBindings for every iteration of termMap. I'm leaving
    //  the code here as a reminder that clever functional composition 
    //  doesn't prevent terrible time complexity.
    // const boundTermMap = R.map(domainAndRangeBinder(pqBindings), termMap);

    return R.values(termMap);
};

// Graph -> [TermViewModel]
const termsFor = R.ifElse(R.isNil, R.always([]), generateViewModel);

module.exports = {
    termsFor
};
