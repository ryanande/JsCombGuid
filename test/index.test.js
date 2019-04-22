import assert from 'assert';
import { generateCombGuid } from '../src/index';

describe('Array', () => {
  describe('generateCombGuid()', () => {
    it('should return a 36 char string', () => {
        let val = generateCombGuid();
        assert.equal(val.length, 36);
    });
    it('should have 5 segments split on -', () => {
        let val = generateCombGuid();
        assert.equal(val.split('-').length, 5);
    });
  });
});