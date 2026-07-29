import AtlassianManager, {unionAtlassianScopes} from '../AtlassianManager'

const {SCOPE, CONFLUENCE_SCOPE} = AtlassianManager

describe('unionAtlassianScopes', () => {
  it('leaves the request untouched when nothing is held', () => {
    const requested = [...CONFLUENCE_SCOPE, 'offline_access' as const]
    expect(unionAtlassianScopes(requested, null).sort()).toEqual([...requested].sort())
    expect(unionAtlassianScopes(requested, []).sort()).toEqual([...requested].sort())
  })
  it('carries held Jira scopes, so enabling Confluence never downgrades', () => {
    const result = unionAtlassianScopes([...CONFLUENCE_SCOPE, 'offline_access'], SCOPE)
    SCOPE.forEach((s) => expect(result).toContain(s))
    CONFLUENCE_SCOPE.forEach((s) => expect(result).toContain(s))
  })
  it('carries held Confluence scopes, so connecting Jira never downgrades', () => {
    const result = unionAtlassianScopes(SCOPE, [...CONFLUENCE_SCOPE, 'offline_access'])
    CONFLUENCE_SCOPE.forEach((s) => expect(result).toContain(s))
    expect(result).toContain('offline_access')
  })
  it('resolves a bare refresh (offline_access only) to exactly the held scopes', () => {
    const held = [...CONFLUENCE_SCOPE, 'offline_access']
    const result = unionAtlassianScopes(['offline_access'], held)
    CONFLUENCE_SCOPE.forEach((s) => expect(result).toContain(s))
    SCOPE.filter((s) => s !== 'offline_access').forEach((s) => expect(result).not.toContain(s))
  })
  it('carries unknown held scopes verbatim (future products are never dropped)', () => {
    const result = unionAtlassianScopes(['offline_access'], ['read:whiteboard:confluence'])
    expect(result).toContain('read:whiteboard:confluence')
  })
  it('falls back to the Jira set when the union has no product scopes', () => {
    const result = unionAtlassianScopes(['offline_access'], null)
    SCOPE.forEach((s) => expect(result).toContain(s))
  })
  it('does not duplicate scopes', () => {
    const result = unionAtlassianScopes([...SCOPE, ...CONFLUENCE_SCOPE], [...SCOPE])
    expect(new Set(result).size).toBe(result.length)
  })
})
