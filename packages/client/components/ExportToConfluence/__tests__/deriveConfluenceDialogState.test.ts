import {deriveConfluenceDialogState} from '../deriveConfluenceDialogState'

const conn = (
  overrides: Partial<{hasConfluenceScopes: boolean; confluenceSites: unknown[]}> = {}
) => ({
  hasConfluenceScopes: true,
  confluenceSites: [{cloudId: 'c1', name: 'S', url: ''}],
  ...overrides
})

describe('deriveConfluenceDialogState', () => {
  it('no connection → S0', () => {
    expect(deriveConfluenceDialogState({connection: null, activeExport: null})).toBe('S0')
  })
  it('connection without scopes → S1', () => {
    expect(
      deriveConfluenceDialogState({
        connection: conn({hasConfluenceScopes: false}),
        activeExport: null
      })
    ).toBe('S1')
  })
  it('scopes but zero sites → EMPTY', () => {
    expect(
      deriveConfluenceDialogState({connection: conn({confluenceSites: []}), activeExport: null})
    ).toBe('EMPTY')
  })
  it('ready → S2; running export → S3; finished export → S4', () => {
    expect(deriveConfluenceDialogState({connection: conn(), activeExport: null})).toBe('S2')
    expect(
      deriveConfluenceDialogState({connection: conn(), activeExport: {status: 'running'}})
    ).toBe('S3')
    expect(
      deriveConfluenceDialogState({connection: conn(), activeExport: {status: 'partial'}})
    ).toBe('S4')
    expect(
      deriveConfluenceDialogState({connection: conn(), activeExport: {status: 'success'}})
    ).toBe('S4')
  })
})
