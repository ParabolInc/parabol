import chunkArray from '../chunkArray';

describe('chunkArray', () => {
  it('validates the array argument', () => {
    expect(() => chunkArray('foo', 1)).toThrowError(/must be an Array/);
  });

  it('validates the chunk size', () => {
    expect(() => chunkArray([1, 2, 3], 'foo')).toThrowError(/must be a Number/);
    expect(() => chunkArray([1, 2, 3], 0)).toThrowError(/greater than 0/);
    expect(() => chunkArray([1, 2, 3], -1)).toThrowError(/greater than 0/);
  });

  it('returns an array of one chunk when the chunk size equals the size of the array', () => {
    expect(chunkArray([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
  });

  it('returns an array of one chunk when the chunk size is greater than the size of the array', () => {
    expect(chunkArray([1, 2, 3], 4)).toEqual([[1, 2, 3]]);
  });

  it('returns an array of equally sized chunks when the chunk size cleanly divides into the array length', () => {
    expect(chunkArray([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
  });

  it("returns an array with the last chunk smaller than the chunk size when the chunk size doesn't divide into the array length", () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});
