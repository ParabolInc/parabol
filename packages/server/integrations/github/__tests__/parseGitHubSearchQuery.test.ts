import parseGitHubSearchQuery from '../parseGitHubSearchQuery'

describe('parseGitHubSearchQuery', () => {
  it('stores only the normalized queryString', () => {
    expect(parseGitHubSearchQuery(' is:issue IS:open ', {})).toEqual({
      queryString: 'is:issue is:open'
    })
  })

  it('rejects meta keys', () => {
    expect(parseGitHubSearchQuery('is:issue', {isJQL: true})).toBeInstanceOf(Error)
  })

  it('rejects a queryString over the GitHub limit', () => {
    expect(parseGitHubSearchQuery('x'.repeat(257), {})).toBeInstanceOf(Error)
  })
})
