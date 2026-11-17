import buildLinearSearchQuery from '../buildLinearSearchQuery'

describe('buildLinearSearchQuery', () => {
  it('returns the stored shape with sorted project and team ids', () => {
    expect(
      buildLinearSearchQuery(' bug ', {projectIds: ['b', 'a'], teamIds: ['d', 'c', 'd']})
    ).toEqual({queryString: 'bug', projectIds: ['a', 'b'], teamIds: ['c', 'd']})
  })

  it.each([
    ['missing projectIds', {teamIds: []}],
    ['missing teamIds', {projectIds: []}],
    ['non-string team id', {projectIds: [], teamIds: [1]}],
    ['an advanced-query flag', {projectIds: [], teamIds: [], isJQL: true}],
    ['another service’s keys', {projectIds: [], teamIds: [], repos: []}]
  ])('rejects %s', (_label, meta) => {
    expect(buildLinearSearchQuery('bug', meta)).toBeInstanceOf(Error)
  })

  it('rejects an oversized queryString', () => {
    expect(buildLinearSearchQuery('x'.repeat(2001), {projectIds: [], teamIds: []})).toBeInstanceOf(
      Error
    )
  })
})
