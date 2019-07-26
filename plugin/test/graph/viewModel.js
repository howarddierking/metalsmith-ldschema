'use strict';

const R = require('ramda');
require('chai').should();
const viewModel = require('../../src/graph/viewModel');

describe('graph', () => {
    describe('viewModel', () => {
        describe('#termForBinding', () => {
            it("should remove the leading '?' character for keys", () => {
                const bindingPair = R.pair('?id', {
                    termType: 'NamedNode',
                    value: 'http://schema.howarddierking.com/HumanCollaborator'
                });
                const actual = viewModel.termForBinding(bindingPair);
                actual[0].should.eql('id');
            });
            it('should extract the value from the value object', () => {
                const bindingPair = R.pair('?id', {
                    termType: 'NamedNode',
                    value: 'http://schema.howarddierking.com/HumanCollaborator'
                });
                const actual = viewModel.termForBinding(bindingPair);
                actual[1].length.should.eql(1);
                actual[1][0].should.eql('http://schema.howarddierking.com/HumanCollaborator');
            });
        });

        describe('#termsFrom', () => {
            const bindings = [];
            const descriptionBindings = [];
            let emailBinding = null;

            // eslint-disable-next-line no-undef
            before(() => {
                bindings.push(
                    R.fromPairs([
                        R.pair('?id', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/HumanCollaborator'
                        }),
                        R.pair('?type', {
                            termType: 'NamedNode',
                            value: 'http://www.w3.org/2000/01/rdf-schema#Class'
                        }),
                        R.pair('?label', { termType: 'Literal', value: 'HumanCollaborator' }),
                        R.pair('?comment', {
                            termType: 'Literal',
                            value: 'A person who can perform work.'
                        })
                    ])
                );

                bindings.push(
                    R.fromPairs([
                        R.pair('?id', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/Bug'
                        }),
                        R.pair('?type', {
                            termType: 'NamedNode',
                            value: 'http://www.w3.org/2000/01/rdf-schema#Class'
                        }),
                        R.pair('?label', { termType: 'Literal', value: 'Bug' }),
                        R.pair('?comment', {
                            termType: 'Literal',
                            value:
                                'A unit of work. Traditionally tied to a failure in a software application.'
                        })
                    ])
                );

                bindings.push(
                    R.fromPairs([
                        R.pair('?id', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/username'
                        }),
                        R.pair('?type', {
                            termType: 'NamedNode',
                            value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'
                        }),
                        R.pair('?label', { termType: 'Literal', value: 'username' }),
                        R.pair('?comment', {
                            termType: 'Literal',
                            value: 'A system-scoped identifier for an agent.'
                        }),
                        R.pair('?domain', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/Collaborator'
                        }),
                        R.pair('?range', {
                            termType: 'NamedNode',
                            value: 'http://www.w3.org/2001/XMLSchema#string'
                        }),
                        R.pair('?classification', {
                            termType: 'NamedNode',
                            value: 'http://data.howarddierking.com/pii'
                        })
                    ])
                );

                bindings.push(
                    R.fromPairs([
                        R.pair('?id', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/title'
                        }),
                        R.pair('?type', {
                            termType: 'NamedNode',
                            value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'
                        }),
                        R.pair('?label', { termType: 'Literal', value: 'title' }),
                        R.pair('?comment', { termType: 'Literal', value: 'The name of the item.' }),
                        R.pair('?domain', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/Bug'
                        }),
                        R.pair('?range', {
                            termType: 'NamedNode',
                            value: 'http://www.w3.org/2001/XMLSchema#string'
                        }),
                        R.pair('?classification', {
                            termType: 'NamedNode',
                            value: 'http://data.howarddierking.com/public'
                        })
                    ])
                );

                bindings.push(
                    R.fromPairs([
                        R.pair('?id', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/assignedTo'
                        }),
                        R.pair('?type', {
                            termType: 'NamedNode',
                            value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'
                        }),
                        R.pair('?label', { termType: 'Literal', value: 'assignedTo' }),
                        R.pair('?comment', {
                            termType: 'Literal',
                            value: 'Zero or more agents that are assigned to a unit of work.'
                        }),
                        R.pair('?domain', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/Bug'
                        }),
                        R.pair('?range', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/Collaborator'
                        }),
                        R.pair('?classification', {
                            termType: 'NamedNode',
                            value: 'http://data.howarddierking.com/public'
                        })
                    ])
                );

                bindings.push(
                    R.fromPairs([
                        R.pair('?id', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/Collaborator'
                        }),
                        R.pair('?type', {
                            termType: 'NamedNode',
                            value: 'http://www.w3.org/2000/01/rdf-schema#Class'
                        }),
                        R.pair('?label', { termType: 'Literal', value: 'Collaborator' }),
                        R.pair('?comment', {
                            termType: 'Literal',
                            value: 'An agent who can perform work.'
                        })
                    ])
                );

                const db1 = R.fromPairs([
                    R.pair('?id', {
                        termType: 'NamedNode',
                        value: 'http://schema.howarddierking.com/description'
                    }),
                    R.pair('?type', {
                        termType: 'NamedNode',
                        value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'
                    }),
                    R.pair('?label', { termType: 'Literal', value: 'description' }),
                    R.pair('?comment', {
                        termType: 'Literal',
                        value:
                            "A more detailed explanation than what may be contained in an object's name."
                    }),
                    R.pair('?domain', {
                        termType: 'NamedNode',
                        value: 'http://schema.howarddierking.com/Bug'
                    }),
                    R.pair('?range', {
                        termType: 'NamedNode',
                        value: 'http://www.w3.org/2001/XMLSchema#string'
                    }),
                    R.pair('?classification', {
                        termType: 'NamedNode',
                        value: 'http://data.howarddierking.com/public'
                    })
                ]);

                const db2 = R.fromPairs([
                    R.pair('?id', {
                        termType: 'NamedNode',
                        value: 'http://schema.howarddierking.com/description'
                    }),
                    R.pair('?type', {
                        termType: 'NamedNode',
                        value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'
                    }),
                    R.pair('?label', { termType: 'Literal', value: 'description' }),
                    R.pair('?comment', {
                        termType: 'Literal',
                        value:
                            "A more detailed explanation than what may be contained in an object's name."
                    }),
                    R.pair('?domain', {
                        termType: 'NamedNode',
                        value: 'http://schema.howarddierking.com/Collaborator'
                    }),
                    R.pair('?range', {
                        termType: 'NamedNode',
                        value: 'http://www.w3.org/2001/XMLSchema#string'
                    }),
                    R.pair('?classification', {
                        termType: 'NamedNode',
                        value: 'http://data.howarddierking.com/public'
                    })
                ]);

                descriptionBindings.push(db1);
                descriptionBindings.push(db2);

                bindings.push(db1);
                bindings.push(db2);

                bindings.push(
                    R.fromPairs([
                        R.pair('?id', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/assignment'
                        }),
                        R.pair('?type', {
                            termType: 'NamedNode',
                            value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'
                        }),
                        R.pair('?label', { termType: 'Literal', value: 'assignment' }),
                        R.pair('?comment', {
                            termType: 'Literal',
                            value: 'Zero or more units of work that are associated with an agent.'
                        }),
                        R.pair('?domain', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/Collaborator'
                        }),
                        R.pair('?range', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/Bug'
                        }),
                        R.pair('?classification', {
                            termType: 'NamedNode',
                            value: 'http://data.howarddierking.com/public'
                        })
                    ])
                );

                emailBinding = R.fromPairs([
                    R.pair('?id', {
                        termType: 'NamedNode',
                        value: 'http://schema.howarddierking.com/email'
                    }),
                    R.pair('?type', {
                        termType: 'NamedNode',
                        value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'
                    }),
                    R.pair('?label', { termType: 'Literal', value: 'email' }),
                    R.pair('?comment', {
                        termType: 'Literal',
                        value: 'An email address for contact.'
                    }),
                    R.pair('?domain', {
                        termType: 'NamedNode',
                        value: 'http://schema.howarddierking.com/HumanCollaborator'
                    }),
                    R.pair('?range', {
                        termType: 'NamedNode',
                        value: 'http://www.w3.org/2001/XMLSchema#string'
                    }),
                    R.pair('?classification', {
                        termType: 'NamedNode',
                        value: 'http://data.howarddierking.com/pii'
                    })
                ]);

                bindings.push(emailBinding);

                bindings.push(
                    R.fromPairs([
                        R.pair('?id', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/status'
                        }),
                        R.pair('?type', {
                            termType: 'NamedNode',
                            value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'
                        }),
                        R.pair('?label', { termType: 'Literal', value: 'status' }),
                        R.pair('?comment', {
                            termType: 'Literal',
                            value: 'An identifier describing the state of an object in a workflow.'
                        }),
                        R.pair('?domain', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/Bug'
                        }),
                        R.pair('?range', {
                            termType: 'NamedNode',
                            value: 'http://www.w3.org/2001/XMLSchema#string'
                        }),
                        R.pair('?classification', {
                            termType: 'NamedNode',
                            value: 'http://data.howarddierking.com/public'
                        })
                    ])
                );

                bindings.push(
                    R.fromPairs([
                        R.pair('?id', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/watchedBy'
                        }),
                        R.pair('?type', {
                            termType: 'NamedNode',
                            value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'
                        }),
                        R.pair('?label', { termType: 'Literal', value: 'watchedBy' }),
                        R.pair('?comment', {
                            termType: 'Literal',
                            value:
                                'Zero or more agents that wish to be kept updated on the status of a unit of work.'
                        }),
                        R.pair('?domain', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/Bug'
                        }),
                        R.pair('?range', {
                            termType: 'NamedNode',
                            value: 'http://schema.howarddierking.com/Collaborator'
                        }),
                        R.pair('?classification', {
                            termType: 'NamedNode',
                            value: 'http://data.howarddierking.com/public'
                        })
                    ])
                );
            });

            // todo - determine the names for specific xform functions
            it('should produce a set of unique terms', () => {
                const actual = viewModel.termsFrom(bindings);
                actual.length.should.eql(11);
            });

            it('should produce a term containing the number of keys in the query binding', () => {
                const actual = viewModel.termsFrom([emailBinding]);
                actual.length.should.eql(1);
                R.keys(actual[0]).length.should.eql(7);
            });

            it("should strip the leading '?' character", () => {
                const actual = viewModel.termsFrom([emailBinding]);
                actual.length.should.eql(1);
                R.keys(actual[0])[0].should.eql('id');
            });
            it('should set the all term values to a list', () => {
                const actual = viewModel.termsFrom([emailBinding]);
                actual.length.should.eql(1);
                R.all(R.is(Array), R.values(actual[0])).should.be.true;
            });
            it('should build up the list of values when there are duplicate query bindings for the same term', () => {
                const actual = viewModel.termsFrom(descriptionBindings);
                actual.length.should.eql(1);
                R.keys(actual[0]).length.should.eql(7);
                actual[0].domain.length.should.eql(2);
            });
        });
    });
});
