import * as fsImpl from '../src/fs.js';
import {should} from 'chai';
should();

describe('metalsmithFs/impl', () => {
    describe('#hasFileExtension', () => {
        it('should return true when matching json-ld', () => {
            fsImpl.isRdf('file.jsonld').should.be.true;
        });
        it('should return true when matching turtle', () => {
            fsImpl.isRdf('file.ttl').should.be.true;
        });
        it('should return true for matching extension regardless of path', () => {
            fsImpl.isRdf('/foo/bar/baz/file.ttl').should.be.true;
        });
        it('should return false when not matching provided file extensions', () => {
            fsImpl.isRdf('file.foo').should.be.false;
        });
        it('should return false when input is nil', () => {
            fsImpl.isRdf(null).should.be.false;
            fsImpl.isRdf(undefined).should.be.false;
        });
    });

    describe('#getRdfFiles', () => {
        it('should return subset of files matching RDF extensions', () => {
            const input = {
                './src/file1.ttl': { data: 'some data' },
                './src/file2.js': { data: 'some data' },
                './src/file3.gif': { data: 'some data' },
                './src/file4.jsonld': { data: 'some data' },
                './src/file5.md': { data: 'some data' }
            };

            const expected = {
                './src/file1.ttl': { data: 'some data' },
                './src/file4.jsonld': { data: 'some data' }
            };

            fsImpl.getRdfFiles(input).should.deep.equal(expected);
        });
        it('should return an empty set if no files match RDF extensions', () => {
            const input = {
                './src/file1.html': { data: 'some data' },
                './src/file2.js': { data: 'some data' },
                './src/file3.gif': { data: 'some data' },
                './src/file4.jpg': { data: 'some data' },
                './src/file5.md': { data: 'some data' }
            };

            const expected = {};

            fsImpl.getRdfFiles(input).should.deep.equal(expected);
        });
        it('should return an empty set if empty object supplied', () => {
            fsImpl.getRdfFiles({}).should.deep.equal({});
        });
    });

    describe('#filePairs', () => {
        it('should reduce the files object to a simple {filename: *} object', () => {
            const input = {
                './src/file1.ttl': { contents: 'some data' },
                './src/file4.jsonld': { contents: 'some data' }
            };

            const expected = {
                './src/file1.ttl': 'some data',
                './src/file4.jsonld': 'some data'
            };

            fsImpl.filePairs(input).should.deep.equal(expected);
        });
    });
});
