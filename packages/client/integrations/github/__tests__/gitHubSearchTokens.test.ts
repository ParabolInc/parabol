import toGitHubQueryString from '../gitHubSearchTokens'

const state = (queryString: string, repos: string[] = []) => ({
  queryString,
  isAdvancedQuery: false,
  filters: repos.map((value) => ({key: 'repo', value}))
})

describe('toGitHubQueryString', () => {
  it('appends repo filters as tokens', () => {
    expect(toGitHubQueryString(state('is:issue is:open', ['parabol/parabol']))).toBe(
      'is:issue is:open repo:parabol/parabol'
    )
  })

  it('does not duplicate a token already present in a legacy query string', () => {
    expect(toGitHubQueryString(state('is:issue repo:parabol/parabol', ['parabol/parabol']))).toBe(
      'is:issue repo:parabol/parabol'
    )
  })

  it('returns the query string untouched when there are no filters', () => {
    expect(toGitHubQueryString(state('is:issue'))).toBe('is:issue')
  })

  it('appends only the filters a legacy query string is missing', () => {
    expect(
      toGitHubQueryString(state('is:issue repo:parabol/parabol', ['parabol/parabol', 'parabol/ai']))
    ).toBe('is:issue repo:parabol/parabol repo:parabol/ai')
  })

  it('appends each repo once even when the filter list repeats it', () => {
    expect(toGitHubQueryString(state('is:issue', ['parabol/parabol', 'parabol/parabol']))).toBe(
      'is:issue repo:parabol/parabol'
    )
  })

  it('ignores filters that are not repo filters', () => {
    expect(
      toGitHubQueryString({
        queryString: 'is:issue',
        isAdvancedQuery: false,
        filters: [{key: 'project', value: 'parabol/parabol'}]
      })
    ).toBe('is:issue')
  })

  it('trims the query string and never leads with a space', () => {
    expect(toGitHubQueryString(state('  is:issue  ', ['parabol/parabol']))).toBe(
      'is:issue repo:parabol/parabol'
    )
    expect(toGitHubQueryString(state('', ['parabol/parabol']))).toBe('repo:parabol/parabol')
  })
})
