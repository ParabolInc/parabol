import count from '../count';

describe('count', () => {
  it('counts from 0 by default', () => {
    const counter = count();
    expect(counter.next().value).toBe(0);
    expect(counter.next().value).toBe(1);
  });

  it('can count from arbitrary starting points', () => {
    [-1, 5, 100].forEach((start) => {
      const counter = count(start);
      expect(counter.next().value).toBe(start);
      expect(counter.next().value).toBe(start + 1);
    });
  });
});
