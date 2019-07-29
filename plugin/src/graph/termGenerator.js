'use strict';

const R = require('ramda');
const rdf = require('rdflib');
const Rx = require('../ramdaExt');
const viewModel = require('./viewModel');

// NOTE: while using SPARQL creates a level of indirection between the view model
//       builder and the source data, this approach also makes the names of the
//       select parameters significant.
const graphQuery = R.defaultTo(`prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 

select ?id ?type ?label ?comment ?parent ?domain ?range ?classification
where 
{ 
    ?id rdf:type ?type ;
        rdfs:label ?label .
    OPTIONAL { 
        ?id rdfs:comment ?comment . 
    }
    OPTIONAL { 
        ?id rdfs:domain ?domain;
              rdfs:range ?range .
    }
    OPTIONAL {
        ?id rdfs:subClassOf ?parent .
    }
}`);

const proxyTerm = id => ({
    id: [id],
    label: [id],
    type: ['proxy'],
    href: id
});

// termOrProxy: {k: Term} -> k -> Term
const termOrProxy = R.curry((termMap, termId) => {
    if (R.has(termId, termMap)) return R.prop(termId, termMap);
    return proxyTerm(termId);
});

// containsID: {k: v} -> {k: v} -> Boolean
const containsID = R.pathEq(['id', [0]]);

// uniqueAppendById: a -> [a] -> [a]
const uniqueAppendById = Rx.uniqueAppendWith(containsID);

// ////////// Term Binders ////////////////

// NOTE: This section intentionally mutates the term map. The more pure approach
//       would involve producing multiple term maps - 1 for each domain/range
//       row - and then merge them all back together to produce a final map.
//       For this particular application, such an approach seems unnecessary
//       in both complexity and in memory consumption

const domainBinder = R.curry((termMap, term) => {
    if (!R.has('domain', term)) return;

    const t = term;
    const domainClasses = R.map(termOrProxy(termMap), t.domain);

    t.usedOn = domainClasses;
    R.forEach(c => {
        const domainClass = c;
        const p = R.defaultTo([], R.prop('properties', domainClass));
        domainClass.properties = uniqueAppendById(t, p);
    })(domainClasses);
});

const rangeBinder = R.curry((termMap, term) => {
    if (!R.has('range', term)) return;

    const t = term;
    const rangeClasses = R.map(termOrProxy(termMap), t.range);

    t.expectedTypes = rangeClasses;
    R.forEach(c => {
        const rangeClass = c;
        const vf = R.defaultTo([], R.prop('valueFor', rangeClass));
        rangeClass.valueFor = uniqueAppendById(t, vf);
    })(rangeClasses);
});

const parentBinder = R.curry((termMap, term) => {
    if (!R.has('parent', term)) return;

    const t = term;
    const parentClasses = R.map(termOrProxy(termMap), t.parent);

    // parent
    t.parentClasses = parentClasses;
    R.forEach(c => {
        const parentClass = c;
        const cc = R.defaultTo([], R.prop('childClasses', parentClass));
        parentClass.childClasses = uniqueAppendById(t, cc);
    })(parentClasses);
});

// //////////////////////////////////////////

const addHref = R.curry((base, modelTerm) => {
    const m = modelTerm;
    const u = m.id[0];
    m.href = u.startsWith(base) ? new URL(u).pathname : u;
    return m;
});

// (Graph, String, String) -> [TermViewModel]
const generateViewModel = (g, userQuery, base) => {
    if (R.isNil(g)) return [];

    const query = graphQuery(userQuery);

    // execute query
    const q = rdf.SPARQLToQuery(query, false, g);
    const bindings = g.querySync(q);

    let model = viewModel.termsFrom(bindings);

    // add href to model to support base URI masking for non-prod scenarios
    model = R.map(addHref(base), model);

    // index terms by id for faster relationship binding
    const indexedModel = R.indexBy(R.path(['id', [0]]), model);

    // TODO - seems like there's probably a more generic way to run these binders
    R.forEach(domainBinder(indexedModel), R.values(indexedModel));
    R.forEach(rangeBinder(indexedModel), R.values(indexedModel));
    R.forEach(parentBinder(indexedModel), R.values(indexedModel));

    return model;
};

const knownOntologies = {
    RDFS: rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#'),
    RDF: rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
    XSD: rdf.Namespace('http://www.w3.org/2001/XMLSchema#'),
    OWL: rdf.Namespace('http://www.w3.org/2002/07/owl#')
};

module.exports = {
    termsFor: generateViewModel,
    knownOntologies
};
