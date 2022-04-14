'use strict';

const rdf = require('rdflib');
const R = require('ramda');
require('chai').should();
const path = require('path');
const termGenerator = require('../../src/graph/termGenerator');

const RDFS = rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');
const RDF = rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const XSD = rdf.Namespace('http://www.w3.org/2001/XMLSchema#');
const TEST = rdf.Namespace('http://schema.test.org/');

// borrowed from https://github.com/sindresorhus/is-absolute-url/blob/main/index.js
// isAbsoluteUrl: s -> Boolean
const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
const isAbsoluteUrl = s => ABSOLUTE_URL_REGEX.test(s);


describe('graph', () => {
    describe('termGenerator', () => {
        // Graph -> [Object]
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
            it('should set properties for only existing properties', () => {
                const expected = [
                    {
                        id: ['http://schema.test.org/MyClass'],
                        type: [RDFS('Class').value],
                        label: ['MyClass'],
                        href: 'http://schema.test.org/MyClass'
                    }
                ];

                const actual = termGenerator.termsFor(minTermsGraph);
                actual.should.deep.equal(expected);
            });
            it('should return expected view model for class', () => {
                const expected = [
                    {
                        id: ['http://schema.test.org/MyClass'],
                        type: [RDFS('Class').value],
                        label: ['MyClass'],
                        comment: ['A comment'],
                        href: 'http://schema.test.org/MyClass'
                    }
                ];

                const actual = termGenerator.termsFor(termsGraph);
                actual.should.deep.equal(expected);
            });

            it('should have 2 domain values for propsGraph::description', () => {
                const terms = termGenerator.termsFor(propsGraph);
                const description = R.find(R.pathEq(['id', [0]], TEST('description').value), terms);
                description.domain.length.should.eql(2);
            });

            it('should have 2 range values for propsGraph::description', () => {
                const terms = termGenerator.termsFor(propsGraph);
                const description = R.find(R.pathEq(['id', [0]], TEST('description').value), terms);
                description.range.length.should.eql(2);
            });

            // binder: domain/range
            it('should correctly set class#properties for rdfs:domain values', () => {
                const terms = termGenerator.termsFor(propsGraph);

                const myClass = R.find(R.pathEq(['id', [0]], TEST('MyClass').value), terms);
                myClass.properties.length.should.equal(1);

                const myOtherClass = R.find(
                    R.pathEq(['id', [0]], TEST('MyOtherClass').value),
                    terms
                );
                myOtherClass.properties.length.should.equal(1);
            });
            it('should correctly set property#usedOn for rdfs:domain values', () => {
                const terms = termGenerator.termsFor(propsGraph);
                const description = R.find(R.pathEq(['id', [0]], TEST('description').value), terms);
                description.usedOn.length.should.equal(2);
            });
            it('should correctly set class#valueFor for rdfs:range values', () => {
                const terms = termGenerator.termsFor(propsGraph);
                const myString = R.find(R.pathEq(['id', [0]], TEST('MyString').value), terms);
                myString.valueFor.length.should.equal(1);
            });
            it('should correctly set property#expectedTypes for rdfs:range values', () => {
                const terms = termGenerator.termsFor(propsGraph);
                const description = R.find(R.pathEq(['id', [0]], TEST('description').value), terms);
                description.expectedTypes.length.should.equal(2);
            });

            // binder: parent
            it('should bind classes correctly for inheritence relationships', () => {
                const terms = termGenerator.termsFor(inheritenceGraph);
                const parent = R.find(R.pathEq(['id', [0]], TEST('ParentClass').value), terms);
                const child = R.find(R.pathEq(['id', [0]], TEST('ChildClass').value), terms);

                parent.childClasses.length.should.equal(1);
                child.parentClasses.length.should.equal(1);
            });
        });

        describe('#href', () => {
            it('should always be absolute', () => {
                isAbsoluteUrl(termGenerator.href('', 'http://schema.concursolutions.com/foo'))
                    .should.be.true;
                isAbsoluteUrl(
                    termGenerator.href(
                        'http://localhost:8080',
                        'http://schema.concursolutions.com/foo'
                    )
                ).should.be.true;
            });
            it('should always have the same ending segment as the id when the id differs from the site', () => {
                const id = 'http://schema.concursolutions.com/foo';
                const base = 'http://localhost:8080/';
                path.basename(id).should.eql(path.basename(termGenerator.href(base, id)));
            });
            it('should be prefixed with the site when the id differs from the site', () => {
                const id = 'http://schema.concursolutions.com/foo';
                const base = 'http://localhost:8080/';
                termGenerator.href(base, id).should.eql(`${base}foo`);
            });
            it('should be the same value as the id when the site is the same as the id', () => {
                const id = 'http://schema.concursolutions.com/foo';
                const base = 'http://schema.concursolutions.com/';
                termGenerator.href(base, id).should.eql(id);
            });
            it('should treat undefined as empty string', () => {
                const id = 'http://schema.concursolutions.com/foo';
                const base = undefined;
                isAbsoluteUrl(termGenerator.href(base, id)).should.be.true;
            });
            it('should handle differences in trailing slashes for base', () => {
                const expected = 'http://localhost:8080/sub/foo';
                termGenerator
                    .href('http://localhost:8080/sub/', 'http://schema.concursolutions.com/foo/')
                    .should.eql(expected);
                termGenerator
                    .href('http://localhost:8080/sub', 'http://schema.concursolutions.com/foo/')
                    .should.eql(expected);
                termGenerator
                    .href('http://localhost:8080/sub/', 'http://schema.concursolutions.com/foo')
                    .should.eql(expected);
                termGenerator
                    .href('http://localhost:8080/sub', 'http://schema.concursolutions.com/foo')
                    .should.eql(expected);
            });
        });
    });
});
