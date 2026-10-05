import getActiveInspirationService from '../getActiveInspirationService'

const tab = (service: string, isConnected: boolean) => ({service, isConnected})
const parabol = tab('PARABOL', true)

describe('getActiveInspirationService', () => {
  it('prefers a connected GitHub over a disconnected Jira Data Center', () => {
    const tabs = [parabol, tab('jiraServer', false), tab('github', true)]
    expect(getActiveInspirationService(tabs, '')).toBe('github')
  })

  it('uses tab order when several integrations are connected', () => {
    const tabs = [parabol, tab('jiraServer', true), tab('github', true)]
    expect(getActiveInspirationService(tabs, '')).toBe('jiraServer')
  })

  it('falls back to Parabol when nothing is connected', () => {
    const tabs = [parabol, tab('jiraServer', false), tab('github', false)]
    expect(getActiveInspirationService(tabs, '')).toBe('PARABOL')
  })

  it.each(['jira', 'gitlab', 'linear', 'gcal'])('treats connected %s as eligible', (service) => {
    const tabs = [parabol, tab('jiraServer', false), tab(service, true)]
    expect(getActiveInspirationService(tabs, '')).toBe(service)
  })

  it('keeps a valid stored tab even if it is disconnected', () => {
    const tabs = [parabol, tab('jiraServer', false), tab('github', true)]
    expect(getActiveInspirationService(tabs, 'jiraServer')).toBe('jiraServer')
  })

  it('falls back to the default when the stored tab no longer exists', () => {
    const tabs = [parabol, tab('github', true)]
    expect(getActiveInspirationService(tabs, 'gitlab')).toBe('github')
  })
})
