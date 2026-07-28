import AtlassianManager, {unionAtlassianScopes} from '../AtlassianManager'

const {SCOPE, CONFLUENCE_SCOPE} = AtlassianManager

describe('unionAtlassianScopes', () => {
  it('leaves the request untouched when nothing is held', () => {
    const requested = [...CONFLUENCE_SCOPE, 'offline_access' as const]
    expect(unionAtlassianScopes(requested, {jira: false, confluence: false}).sort()).toEqual(
      [...requested].sort()
    )
  })
  it('adds Jira when held, so enabling Confluence never downgrades', () => {
    const result = unionAtlassianScopes([...CONFLUENCE_SCOPE, 'offline_access'], {
      jira: true,
      confluence: false
    })
    SCOPE.forEach((s) => expect(result).toContain(s))
    CONFLUENCE_SCOPE.forEach((s) => expect(result).toContain(s))
  })
  it('adds Confluence + offline_access when held, so connecting Jira never downgrades', () => {
    const result = unionAtlassianScopes(SCOPE, {jira: false, confluence: true})
    CONFLUENCE_SCOPE.forEach((s) => expect(result).toContain(s))
    expect(result).toContain('offline_access')
  })
  it('resolves a bare refresh (offline_access only) to the held products', () => {
    const result = unionAtlassianScopes(['offline_access'], {jira: false, confluence: true})
    CONFLUENCE_SCOPE.forEach((s) => expect(result).toContain(s))
    SCOPE.filter((s) => s !== 'offline_access').forEach((s) => expect(result).not.toContain(s))
  })
  it('falls back to the Jira set when the union has no product scopes', () => {
    const result = unionAtlassianScopes(['offline_access'], {jira: false, confluence: false})
    SCOPE.forEach((s) => expect(result).toContain(s))
  })
  it('does not duplicate scopes', () => {
    const result = unionAtlassianScopes([...SCOPE, ...CONFLUENCE_SCOPE], {
      jira: true,
      confluence: true
    })
    expect(new Set(result).size).toBe(result.length)
  })
})
