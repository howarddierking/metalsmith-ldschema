'use strict';

const fs = require('fs');
const path = require('path');
const should = require('chai').should();
const loader = require('../../src/graph/loader');

describe('graph', () => {
    describe('loader', () => {
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
                    graph.statements.length.should.equal(72);

                    done();
                });
            });
        });
    });
});
