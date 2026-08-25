import buildJiraSearchQuery from '../buildJiraSearchQuery'

describe('buildJiraSearchQuery', () => {
  it('returns the stored shape with a trimmed queryString and sorted project keys', () => {
    expect(
      buildJiraSearchQuery(' project = ABC ', {isJQL: true, projectKeyFilters: ['DEF', 'ABC']})
    ).toEqual({queryString: 'project = ABC', isJQL: true, projectKeyFilters: ['ABC', 'DEF']})
  })

  it.each([
    ['missing isJQL', {projectKeyFilters: []}],
    ['non-boolean isJQL', {isJQL: 'true', projectKeyFilters: []}],
    ['missing projectKeyFilters', {isJQL: false}],
    ['non-array projectKeyFilters', {isJQL: false, projectKeyFilters: 'ABC'}],
    ['non-string project key', {isJQL: false, projectKeyFilters: [1]}],
    ['empty project key', {isJQL: false, projectKeyFilters: ['']}],
    ['oversized project key', {isJQL: false, projectKeyFilters: ['x'.repeat(65)]}],
    ['too many project keys', {isJQL: false, projectKeyFilters: Array(101).fill('ABC')}],
    ['unknown keys', {isJQL: false, projectKeyFilters: [], junk: 'x'.repeat(1000)}]
  ])('rejects %s', (_label, meta) => {
    expect(buildJiraSearchQuery('bug', meta)).toBeInstanceOf(Error)
  })

  it('rejects an oversized queryString', () => {
    expect(
      buildJiraSearchQuery('x'.repeat(2001), {isJQL: false, projectKeyFilters: []})
    ).toBeInstanceOf(Error)
  })
})
