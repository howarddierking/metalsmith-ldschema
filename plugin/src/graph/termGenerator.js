const R = require('ramda');
const url = require('url');
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
const QB_PARENT = '?parentClass';

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

const relsQuery = `prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 

select ?term ?domain ?range ?parentClass
where 
{ 
    ?term rdf:type ?type .
    OPTIONAL { 
        ?term rdfs:domain ?domain;
              rdfs:range ?range .
    }  
    OPTIONAL { ?term rdfs:subClassOf ?parentClass .}
}`;

// String -> 'class' | 'property' | '(unknown)'
// TODO: test 'unknown' case
const friendlyTypeName = R.cond([
        [R.equals(RDFS('Class').value), R.always('class')],
        [R.equals(RDF('Property').value), R.always('property')],
        [R.T, R.always(DEFAULT_UNKNOWN)]
    ]);

// TODO: TEST
// isInDomain: String -> String -> Boolean
const isInDomain = R.curry((base, id) => {
    if(R.isNil(base) || R.isNil(id)) return false;
    return new URL(base).origin === new URL(id).origin; 
});

// TODO: TEST
// pathname: String -> String
const pathname = s => {
    return new URL(s).pathname;
};

// TODO: TEST
// termFromQueryBinding: String -> Binding -> Term
const termFromQueryBinding = R.curry((base, qb) => {
    return {
        id: qb[QB_TERM].value,
        type: friendlyTypeName(qb[QB_TYPE].value),
        label: qb[QB_LABEL].value,
        comment: R.path([QB_COMMENT, 'value'], qb),
        href: R.when(isInDomain(base), pathname, qb[QB_TERM].value)
    }
});

const proxyTerm = (id) => {
    return {
        id,
        label: id,
        type: 'proxy',
        href: id
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
    const domain = R.path([QB_DOMAIN, 'value'], qb);
    const range = R.path([QB_RANGE, 'value'], qb);

    if(R.isNil(domain) || R.isNil(range)) return;

    const term = termOrProxy(qb[QB_TERM].value, termMap);
    const domainClass = termOrProxy(domain, termMap);
    const rangeClass = termOrProxy(range, termMap);

    // domain
    term.usedOn = uniqueAppendById(domainClass, term.usedOn);
    domainClass.properties = uniqueAppendById(term, domainClass.properties);
    
    // range
    term.expectedTypes = uniqueAppendById(rangeClass, term.expectedTypes);
    rangeClass.valueFor = uniqueAppendById(term, rangeClass.valueFor);
});

const parentClassBinder = R.curry((termMap, qb) => {
    const parent = R.path([QB_PARENT, 'value'], qb);

    if(R.isNil(parent)) return;

    const term = termOrProxy(qb[QB_TERM].value, termMap);
    const parentClass = termOrProxy(parent, termMap);

    // parent
    term.parentClasses = uniqueAppendById(parentClass, term.parentClasses);
    parentClass.childClasses = uniqueAppendById(term, parentClass.childClasses);
});

// Graph, String -> [TermViewModel]
const generateViewModel = (g, base) => {
    if(R.isNil(g)) return [];

    // get terms
    const tq = rdf.SPARQLToQuery(termsQuery, false, g);
    const tqBindings = g.querySync(tq);

    // index terms by id for faster relationship binding
    const termMap = R.pipe(
        R.map(termFromQueryBinding(base)), 
        R.indexBy(R.prop('id')))(tqBindings);

    // bind properties (domain and range)
    const rq = rdf.SPARQLToQuery(relsQuery, false, g);
    const rqBindings = g.querySync(rq);

    R.forEach(domainAndRangeBinder(termMap), rqBindings);
    R.forEach(parentClassBinder(termMap), rqBindings);

    // NO NO NO NO NO NO  
    //  this would result in an O(n^2) complexity because of having to 
    //  iterate rqBindings for every iteration of termMap. I'm leaving
    //  the code here as a reminder that clever functional composition 
    //  doesn't prevent terrible time complexity.
    // const boundTermMap = R.map(domainAndRangeBinder(rqBindings), termMap);

    return R.values(termMap);
};

module.exports = {
    termsFor: generateViewModel
};
