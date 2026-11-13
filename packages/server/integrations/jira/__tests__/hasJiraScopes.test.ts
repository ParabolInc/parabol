import {hasJiraScopes} from '../hasJiraScopes'

const JIRA = 'read:jira-user read:jira-work write:jira-work offline_access'
const CONF =
  'read:page:confluence write:page:confluence read:space:confluence write:attachment:confluence read:content-details:confluence'

describe('hasJiraScopes', () => {
  it('is true for a classic Jira grant', () => {
    expect(hasJiraScopes(JIRA)).toBe(true)
  })
  it('is false for a Confluence-only grant (with offline_access)', () => {
    expect(hasJiraScopes(`${CONF} offline_access`)).toBe(false)
  })
  it('is true for a combined grant in any order', () => {
    expect(hasJiraScopes(`${CONF} ${JIRA}`)).toBe(true)
  })
  it('is false when a Jira scope is missing', () => {
    expect(hasJiraScopes('read:jira-user offline_access')).toBe(false)
  })
  it('is false for null/undefined/empty', () => {
    expect(hasJiraScopes(null)).toBe(false)
    expect(hasJiraScopes(undefined)).toBe(false)
    expect(hasJiraScopes('')).toBe(false)
  })
})
