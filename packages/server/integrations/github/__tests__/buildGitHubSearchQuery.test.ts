import buildGitHubSearchQuery from '../buildGitHubSearchQuery'

describe('buildGitHubSearchQuery', () => {
  it('stores only the normalized queryString', () => {
    expect(buildGitHubSearchQuery(' is:issue IS:open ', {})).toEqual({
      queryString: 'is:issue is:open'
    })
  })

  it('rejects meta keys', () => {
    expect(buildGitHubSearchQuery('is:issue', {isJQL: true})).toBeInstanceOf(Error)
  })

  it('rejects an oversized queryString', () => {
    expect(buildGitHubSearchQuery('x'.repeat(2001), {})).toBeInstanceOf(Error)
  })
})
