import {normalizeSearchFilters, searchFiltersByKey} from '../IntegrationSearchFilter'

describe('normalizeSearchFilters', () => {
  it('orders by key then value so equivalent searches dedupe', () => {
    const sorted = normalizeSearchFilters([
      {key: 'project', value: 'b'},
      {key: 'team', value: 'a'},
      {key: 'project', value: 'a'}
    ])
    expect(sorted).toEqual([
      {key: 'project', value: 'a'},
      {key: 'project', value: 'b'},
      {key: 'team', value: 'a'}
    ])
  })

  it('does not mutate its input', () => {
    const input = [
      {key: 'b', value: '1'},
      {key: 'a', value: '1'}
    ]
    normalizeSearchFilters(input)
    expect(input[0]!.key).toBe('b')
  })

  it('drops exact duplicates', () => {
    expect(
      normalizeSearchFilters([
        {key: 'p', value: 'x'},
        {key: 'p', value: 'x'}
      ])
    ).toEqual([{key: 'p', value: 'x'}])
  })

  it('uses ordinal comparison, not locale-aware collation', () => {
    const sorted = normalizeSearchFilters([
      {key: 'project', value: 'ä'},
      {key: 'project', value: 'z'}
    ])
    expect(sorted).toEqual([
      {key: 'project', value: 'z'},
      {key: 'project', value: 'ä'}
    ])
  })
})

describe('searchFiltersByKey', () => {
  it('returns only the values for that key, in order', () => {
    const filters = [
      {key: 'project', value: 'p1'},
      {key: 'team', value: 't1'},
      {key: 'project', value: 'p2'}
    ]
    expect(searchFiltersByKey(filters, 'project')).toEqual(['p1', 'p2'])
    expect(searchFiltersByKey(filters, 'repo')).toEqual([])
  })
})
