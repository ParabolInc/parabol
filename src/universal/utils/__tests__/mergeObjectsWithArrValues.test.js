import mergeObjectsWithArrValues from 'universal/utils/mergeObjectsWithArrValues';

describe('mergeObjectsWithArrValues', () => {
  test('returns the same object if only 1 is passed', () => {
    // SETUP
    const obj = {
      foo: [],
      bar: [1],
      baz: [1, 2, 3]
    };

    // TEST
    const result = mergeObjectsWithArrValues(obj);

    // VERIFY
    expect(result).toEqual(obj);
  });
  test('merges arrays with matching keys', () => {
    // SETUP
    const obj = {
      foo: [],
      bar: [1],
      baz: [1, 2, 3]
    };
    const obj2 = {
      foo: [1],
      bar: [4, 5]
    };

    // TEST
    const result = mergeObjectsWithArrValues(obj, obj2);

    // VERIFY
    const expected = {
      foo: [1],
      bar: [1, 4, 5],
      baz: [1, 2, 3]
    };
    expect(result).toEqual(expected);
  });
});

