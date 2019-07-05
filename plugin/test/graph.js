'use strict';

const fs = require('fs');
const path = require('path');
const rdf = require('rdflib');
const R = require('ramda');
const should = require('chai').should();
const loader = require('../src/graph/loader');
const termGenerator = require('../src/graph/termGenerator');

const RDFS = rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');
const RDF = rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const XSD = rdf.Namespace('http://www.w3.org/2001/XMLSchema#');
const TEST = rdf.Namespace('http://schema.test.org/');

describe('graph/loader', () => {
    describe('#mediaType', () => {
        it('should return the json-ld media type for a .jsonld file', () => {
            loader.mediaType('file.jsonld').should.equal('application/ld+json');
        });
        it('should return the turtle media type for a .ttl file', () => {
            loader.mediaType('file.ttl').should.equal('text/turtle');
        });
        it('should throw for an unknown file extension', () => {
            (() => {
                loader.mediaType('file.foo');
            }).should.throw();
        });
    });

    describe('#from', () => {
        let input = null;

        // eslint-disable-next-line no-undef
        before(() => {
            input = {
                'bug.ttl': {
                    contents: fs.readFileSync(path.join(__dirname, 'bug.ttl')),
                    mode: '0644'
                },
                'collaborator.jsonld': {
                    contents: fs.readFileSync(path.join(__dirname, 'collaborator.jsonld')),
                    mode: '0644'
                }
            };
        });

        it('should produce a graph from different file types', done => {
            const ret = loader.from(input);

            ret.then(graph => {
                should.exist(graph);
                graph.statements.length.should.equal(64);

                done();
            });
        });
    });
});

// Graph -> [Object]
describe('graph/termGenerator', () => {
    describe('#termsFor', () => {
        let minTermsGraph = null;
        let termsGraph = null;
        let propsGraph = null;
        let inheritenceGraph = null;
        beforeEach(() => {
            minTermsGraph = rdf.graph();
            minTermsGraph.add(TEST('MyClass'), RDF('type'), RDFS('Class'));
            minTermsGraph.add(TEST('MyClass'), RDFS('label'), 'MyClass');

            termsGraph = rdf.graph();
            termsGraph.add(TEST('MyClass'), RDF('type'), RDFS('Class'));
            termsGraph.add(TEST('MyClass'), RDFS('label'), 'MyClass');
            termsGraph.add(TEST('MyClass'), RDFS('comment'), 'A comment');

            propsGraph = rdf.graph();
            propsGraph.add(TEST('MyClass'), RDF('type'), RDFS('Class'));
            propsGraph.add(TEST('MyClass'), RDFS('label'), 'MyClass');
            propsGraph.add(TEST('MyOtherClass'), RDF('type'), RDFS('Class'));
            propsGraph.add(TEST('MyOtherClass'), RDFS('label'), 'MyOtherClass');
            propsGraph.add(TEST('description'), RDF('type'), RDF('Property'));
            propsGraph.add(TEST('description'), RDFS('label'), 'description');
            propsGraph.add(TEST('description'), RDFS('domain'), TEST('MyClass'));
            propsGraph.add(TEST('description'), RDFS('domain'), TEST('MyOtherClass'));
            propsGraph.add(TEST('description'), RDFS('range'), XSD('string'));
            propsGraph.add(TEST('MyString'), RDF('type'), RDFS('Class'));
            propsGraph.add(TEST('MyString'), RDFS('label'), 'MyString');
            propsGraph.add(TEST('description'), RDFS('range'), TEST('MyString'));

            inheritenceGraph = rdf.graph();
            inheritenceGraph.add(TEST('ParentClass'), RDF('type'), RDFS('Class'));
            inheritenceGraph.add(TEST('ParentClass'), RDFS('label'), 'ParentClass');
            inheritenceGraph.add(TEST('ChildClass'), RDF('type'), RDFS('Class'));
            inheritenceGraph.add(TEST('ChildClass'), RDFS('label'), 'ChildClass');
            inheritenceGraph.add(TEST('ChildClass'), RDFS('subClassOf'), TEST('ParentClass'));
            
        });

        it('it should return [] when graph is nil', () => {
            termGenerator.termsFor(null).should.eql([]);
        });
        it('should return 3 term view models for respective graph', () => {
            termGenerator.termsFor(termsGraph).length.should.equal(1);
        });
        it('should set optional terms to Undefined when not present', () => {
            const expected = [
                {
                    id: 'http://schema.test.org/MyClass',
                    type: 'class',
                    label: 'MyClass',
                    comment: undefined,
                    href: 'http://schema.test.org/MyClass'
                }
            ];

            termGenerator.termsFor(minTermsGraph).should.deep.equal(expected);
        });
        it('should return expected view model for class', () => {
            const expected = [
                {
                    id: 'http://schema.test.org/MyClass',
                    type: 'class',
                    label: 'MyClass',
                    comment: 'A comment',
                    href: 'http://schema.test.org/MyClass'
                }
            ];

            termGenerator.termsFor(termsGraph).should.deep.equal(expected);
        });
        it('should correctly set class#properties for rdfs:domain values', () => {
            const terms = termGenerator.termsFor(propsGraph);
            const myClass = R.find(R.propEq('id', TEST('MyClass').value), terms);
            myClass.properties.length.should.equal(1);

            const myOtherClass = R.find(R.propEq('id', TEST('MyOtherClass').value), terms);
            myOtherClass.properties.length.should.equal(1);
        });
        it('should correctly set property#usedOn for rdfs:domain values', () => {
            const terms = termGenerator.termsFor(propsGraph);
            const description = R.find(R.propEq('id', TEST('description').value), terms);
            description.usedOn.length.should.equal(2);
        });
        it('should correctly set class#valueFor for rdfs:range values', () => {
            const terms = termGenerator.termsFor(propsGraph);
            const myString = R.find(R.propEq('id', TEST('MyString').value), terms);
            myString.valueFor.length.should.equal(1);
        });
        it('should correctly set property#expectedTypes for rdfs:range values', () => {
            const terms = termGenerator.termsFor(propsGraph);
            const description = R.find(R.propEq('id', TEST('description').value), terms);
            description.expectedTypes.length.should.equal(2);
        });
        it('should bind classes correctly for inheritence relationships', () => {
            const terms = termGenerator.termsFor(inheritenceGraph);
            const parent = R.find(R.propEq('id', TEST('ParentClass').value), terms);
            const child = R.find(R.propEq('id', TEST('ChildClass').value), terms);

            parent.childClasses.length.should.equal(1);
            child.parentClasses.length.should.equal(1);
        });
        it('should specify the fully qualified href value when base is undefined', () => {
            const terms = termGenerator.termsFor(propsGraph);
            terms[0].href.should.eql('http://schema.test.org/MyClass');
        });
        it('should specify the path only for the href value when base is defined for the term', () => {
            const terms = termGenerator.termsFor(propsGraph, 'http://schema.test.org');
            terms[0].href.should.eql('/MyClass');
        });
    });
});
