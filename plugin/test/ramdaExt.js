'use strict';

require('chai').should();
const R = require('ramda');
const Rx = require('../src/ramdaExt');

// containsID: {k: v} -> {k: v} -> Boolean
const containsID = R.eqProps('id');

describe('ramdaExt', () => {
    describe('#uniqueAppend', () => {
        it('should append item to list when not found in the list', () => {
            Rx.uniqueAppend(1, [2, 3]).should.eql([2, 3, 1]);
        });
        it('should not append item to list when it is already in the list', () => {
            Rx.uniqueAppend(2, [2, 3]).should.eql([2, 3]);
        });
        it('should append item to list when list is nil', () => {
            Rx.uniqueAppend(2, undefined).should.eql([2]);
        });
    });

    describe('uniqueAppendWith', () => {
        it('should append item to list when not found in the list', () => {
            const entry = { id: 'baz', q: 'a' };
            const list = [{ id: 'foo', q: 'b' }, { id: 'bar', q: 'c' }];
            const expected = [{ id: 'foo', q: 'b' }, { id: 'bar', q: 'c' }, { id: 'baz', q: 'a' }];
            Rx.uniqueAppendWith(containsID, entry, list).should.eql(expected);
        });
        it('should not append item to list when it is already in the list', () => {
            const entry = { id: 'foo', q: 'a' };
            const list = [{ id: 'foo', q: 'b' }, { id: 'bar', q: 'c' }];
            Rx.uniqueAppendWith(containsID, entry, list).should.eql(list);
        });
    });
});
