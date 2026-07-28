import {validateAtlassianScopes} from '../validateAtlassianScopes'

describe('validateAtlassianScopes', () => {
  it('returns the joined string for the Jira + Confluence scope sets', () => {
    const scopes = [
      'read:jira-user',
      'read:jira-work',
      'write:jira-work',
      'offline_access',
      'read:page:confluence',
      'write:page:confluence',
      'read:space:confluence',
      'write:attachment:confluence'
    ]
    expect(validateAtlassianScopes(scopes)).toBe(scopes.join(' '))
  })
  it('accepts manage:jira-project', () => {
    expect(validateAtlassianScopes(['manage:jira-project', 'offline_access'])).toBe(
      'manage:jira-project offline_access'
    )
  })
  it('returns null when any entry is unknown', () => {
    expect(validateAtlassianScopes(['read:jira-user', 'read:evil-scope'])).toBeNull()
  })
  it('returns null for undefined/null/empty input (caller falls back to default)', () => {
    expect(validateAtlassianScopes(undefined)).toBeNull()
    expect(validateAtlassianScopes(null)).toBeNull()
    expect(validateAtlassianScopes([])).toBeNull()
  })
})
