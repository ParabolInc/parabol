import {GITHUB_MAX_SEARCH_QUERY_LENGTH, gitHubQueryValidation} from '../gitHubQueryValidation'

describe('gitHubQueryValidation', () => {
  it('accepts a query exactly at the GitHub limit', () => {
    expect(gitHubQueryValidation('x'.repeat(GITHUB_MAX_SEARCH_QUERY_LENGTH))).toBeNull()
  })

  it('rejects a query one character over the GitHub limit', () => {
    expect(gitHubQueryValidation('x'.repeat(GITHUB_MAX_SEARCH_QUERY_LENGTH + 1))).toMatch(
      /256 characters/
    )
  })

  it('still rejects user and repository searches', () => {
    expect(gitHubQueryValidation('is:user foo')).toMatch(/is:user/)
    expect(gitHubQueryValidation('IS:REPOSITORY foo')).toMatch(/is:repository/)
  })

  it('accepts the default poker query', () => {
    expect(gitHubQueryValidation('is:issue is:open sort:updated involves:@me')).toBeNull()
  })
})
