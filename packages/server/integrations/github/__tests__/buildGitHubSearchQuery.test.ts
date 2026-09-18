import buildGitHubSearchQuery from '../buildGitHubSearchQuery'

describe('buildGitHubSearchQuery', () => {
  it('stores only the normalized queryString when no repos are selected', () => {
    expect(buildGitHubSearchQuery(' is:issue IS:open ', {})).toEqual({
      queryString: 'is:issue is:open'
    })
    expect(buildGitHubSearchQuery('is:issue', {repos: []})).toEqual({queryString: 'is:issue'})
  })

  it('stores sorted, deduped repos', () => {
    expect(
      buildGitHubSearchQuery('bug', {
        repos: ['parabol/parabol', 'parabol/action', 'parabol/parabol']
      })
    ).toEqual({queryString: 'bug', repos: ['parabol/action', 'parabol/parabol']})
  })

  it.each([
    ['unknown keys', {isJQL: true}],
    ['non-array repos', {repos: 'parabol/parabol'}],
    ['non-string repo', {repos: [1]}],
    ['empty repo', {repos: ['']}],
    ['too many repos', {repos: Array.from({length: 101}, (_, idx) => `parabol/repo${idx}`)}]
  ])('rejects %s', (_label, meta) => {
    expect(buildGitHubSearchQuery('is:issue', meta)).toBeInstanceOf(Error)
  })

  it('rejects an oversized queryString', () => {
    expect(buildGitHubSearchQuery('x'.repeat(2001), {})).toBeInstanceOf(Error)
  })
})
