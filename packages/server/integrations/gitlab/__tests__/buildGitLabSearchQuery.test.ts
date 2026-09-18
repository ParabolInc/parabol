import buildGitLabSearchQuery from '../buildGitLabSearchQuery'

describe('buildGitLabSearchQuery', () => {
  it('returns the stored shape with a trimmed queryString and sorted, deduped project ids', () => {
    expect(
      buildGitLabSearchQuery(' bug ', {
        projectIds: ['gid://gitlab/Project/2', 'gid://gitlab/Project/1', 'gid://gitlab/Project/2']
      })
    ).toEqual({
      queryString: 'bug',
      projectIds: ['gid://gitlab/Project/1', 'gid://gitlab/Project/2']
    })
  })

  it.each([
    ['missing projectIds', {}],
    ['non-array projectIds', {projectIds: 'gid://gitlab/Project/1'}],
    ['empty project id', {projectIds: ['']}],
    ['an advanced-query flag', {projectIds: [], isJQL: true}],
    ['another service’s keys', {projectIds: [], teamIds: []}]
  ])('rejects %s', (_label, meta) => {
    expect(buildGitLabSearchQuery('bug', meta)).toBeInstanceOf(Error)
  })

  it('rejects an oversized queryString', () => {
    expect(buildGitLabSearchQuery('x'.repeat(2001), {projectIds: []})).toBeInstanceOf(Error)
  })
})
