import {deriveConfluenceDialogState} from '../deriveConfluenceDialogState'

describe('deriveConfluenceDialogState', () => {
  it('asks to connect Atlassian when no team has an Atlassian auth', () => {
    expect(
      deriveConfluenceDialogState({
        hasAtlassianAuth: false,
        hasConfluenceAccess: false,
        activeExport: null
      })
    ).toBe('connectAtlassian')
  })
  it('asks to enable Confluence when connected without Confluence scopes', () => {
    expect(
      deriveConfluenceDialogState({
        hasAtlassianAuth: true,
        hasConfluenceAccess: false,
        activeExport: null
      })
    ).toBe('enableConfluence')
  })
  it('shows the form when Confluence access exists and no export is active', () => {
    expect(
      deriveConfluenceDialogState({
        hasAtlassianAuth: true,
        hasConfluenceAccess: true,
        activeExport: null
      })
    ).toBe('form')
  })
  it('shows live progress while the active export is running', () => {
    expect(
      deriveConfluenceDialogState({
        hasAtlassianAuth: true,
        hasConfluenceAccess: true,
        activeExport: {status: 'running'}
      })
    ).toBe('exporting')
  })
  it.each(['success', 'partial', 'failed'])('shows the report when the export is %s', (status) => {
    expect(
      deriveConfluenceDialogState({
        hasAtlassianAuth: true,
        hasConfluenceAccess: true,
        activeExport: {status}
      })
    ).toBe('report')
  })
})
