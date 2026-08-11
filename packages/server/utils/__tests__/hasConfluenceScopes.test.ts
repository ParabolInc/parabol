import {hasConfluenceScopes} from '../hasConfluenceScopes'

const JIRA = 'read:jira-user read:jira-work write:jira-work offline_access'
const CONF =
  'read:page:confluence write:page:confluence read:space:confluence write:attachment:confluence read:content-details:confluence'

describe('hasConfluenceScopes', () => {
  it('is false for a Jira-only scope string', () => {
    expect(hasConfluenceScopes(JIRA)).toBe(false)
  })
  it('is true when all four Confluence scopes are present (any order, extra scopes ok)', () => {
    expect(hasConfluenceScopes(`${JIRA} ${CONF}`)).toBe(true)
    expect(hasConfluenceScopes(CONF.split(' ').reverse().join(' '))).toBe(true)
  })
  it('is false when any one Confluence scope is missing', () => {
    expect(hasConfluenceScopes(`${JIRA} write:confluence-content write:confluence-file`)).toBe(
      false
    )
  })
  it('is false for null/undefined/empty', () => {
    expect(hasConfluenceScopes(null)).toBe(false)
    expect(hasConfluenceScopes(undefined)).toBe(false)
    expect(hasConfluenceScopes('')).toBe(false)
  })
})
