const should = require('chai').should();
const Rx = require('../src/ramdaExt');
const R = require('ramda');

// containsID: a -> [a] -> Boolean
const containsID = (val, o) => {
    debugger;
    let ret = R.any(
        R.propEq('id', R.prop('id', val)),
        o);
    return ret;
};

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

    describe('#safeIncludes', () => {
        it('should return true when item is found in list', () => {
            Rx.safeIncludes(2, [2, 3]).should.be.true;
        });
        it('should return false when list is nil', () => {
            Rx.safeIncludes(2, undefined).should.be.false;
        });
        it('should return false when item is nil', () => {
            Rx.safeIncludes(undefined, [1, 2]).should.be.false;
        });
    });

    describe('#safeIncludesWith', () => {
        it('should return false based on id property equality', () => {
            const entry = {id: 'baz', q: 'a'};
            const list = [{id: 'foo', q: 'b'}, {id: 'bar', q: 'c'}];
            Rx.safeIncludesWith(containsID, entry, list).should.be.false;
        });
        it('should return true based on id property equality', () => {
            const entry = {id: 'foo', q: 'a'};
            const list = [{id: 'foo', q: 'b'}, {id: 'bar', q: 'c'}];
            Rx.safeIncludesWith(containsID, entry, list).should.be.true;
        });
    });

    describe.only('uniqueAppendWith', () => {
        it('should append item to list when not found in the list', () => {
            const entry = {id: 'baz', q: 'a'};
            const list = [{id: 'foo', q: 'b'}, {id: 'bar', q: 'c'}];
            const expected = [{id: 'foo', q: 'b'}, {id: 'bar', q: 'c'}, {id: 'baz', q: 'a'}]
            Rx.uniqueAppendWith(containsID, entry, list).should.eql(expected);
        });
        it('should not append item to list when it is already in the list', () => {
            const entry = {id: 'foo', q: 'a'};
            const list = [{id: 'foo', q: 'b'}, {id: 'bar', q: 'c'}];
            Rx.uniqueAppend(containsID, entry, list).should.eql(list);
        });
    });
});
