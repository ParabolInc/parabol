import {
  DEFAULT_INSPIRATION_SOURCE_SETTINGS,
  type InspirationSourceService
} from '../inspirationSources'
import layoutInspirationSources from '../layoutInspirationSources'

const REGISTRY_ORDER: InspirationSourceService[] = [
  'PARABOL',
  'jira',
  'github',
  'linear',
  'azureDevOps',
  'clickup',
  'gcal'
]

interface Scenario {
  connected?: InspirationSourceService[]
  turnedOff?: InspirationSourceService[]
  orgServices?: string[]
}

const layout = ({connected = [], turnedOff = [], orgServices = []}: Scenario) => {
  const sources = REGISTRY_ORDER.map((service) => ({
    service,
    isConnected: service === 'PARABOL' || connected.includes(service)
  }))
  const kinds = {...DEFAULT_INSPIRATION_SOURCE_SETTINGS.kinds}
  turnedOff.forEach((service) => {
    kinds[service] = []
  })
  const {row, more} = layoutInspirationSources(sources, kinds, orgServices)
  return {row: row.map(({service}) => service), more: more.map(({service}) => service)}
}

describe('layoutInspirationSources', () => {
  it('suggests one service per category when nothing is connected', () => {
    expect(layout({})).toEqual({
      row: ['PARABOL', 'jira', 'github', 'gcal'],
      more: ['linear', 'azureDevOps', 'clickup']
    })
  })

  it('keeps a connected tracker’s rivals in More', () => {
    expect(layout({connected: ['linear', 'gcal']})).toEqual({
      row: ['PARABOL', 'linear', 'gcal', 'github'],
      more: ['jira', 'azureDevOps', 'clickup']
    })
  })

  it('suggests every tracker the org links tasks to', () => {
    expect(layout({orgServices: ['azureDevOps', 'jira']})).toEqual({
      row: ['PARABOL', 'azureDevOps', 'jira', 'github'],
      more: ['gcal', 'linear', 'clickup']
    })
  })

  it('puts services in use ahead of connected ones that are off', () => {
    expect(layout({connected: ['jira', 'github', 'gcal'], turnedOff: ['github']})).toEqual({
      row: ['PARABOL', 'jira', 'gcal', 'github'],
      more: ['linear', 'azureDevOps', 'clickup']
    })
  })

  it('wraps rather than hide a service in use', () => {
    const connected: InspirationSourceService[] = ['jira', 'github', 'linear', 'azureDevOps']
    expect(layout({connected})).toEqual({
      row: ['PARABOL', 'jira', 'github', 'linear', 'azureDevOps'],
      more: ['gcal', 'clickup']
    })
  })

  it('shows every tile when only one would go in More', () => {
    const connected: InspirationSourceService[] = [
      'jira',
      'github',
      'linear',
      'azureDevOps',
      'gcal'
    ]
    expect(layout({connected}).more).toEqual([])
  })
})
