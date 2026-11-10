import buildInspirationSearchQuery from '../buildInspirationSearchQuery'
import {
  DEFAULT_INSPIRATION_SOURCE_SETTINGS,
  withInspirationSourceDefaults
} from '../inspirationSources'

const dateRange = {
  startAt: new Date(2026, 8, 17, 9, 0).toISOString(),
  endAt: new Date(2026, 8, 24, 17, 0).toISOString()
}
const dateClause = 'updated >= "2026-09-17 09:00" AND updated <= "2026-09-24 17:00"'

const jiraQuery = (kinds: string[], jiraProjectIds: string[] = []) =>
  buildInspirationSearchQuery(
    'jira',
    {
      ...DEFAULT_INSPIRATION_SOURCE_SETTINGS,
      kinds: {...DEFAULT_INSPIRATION_SOURCE_SETTINGS.kinds, jira: kinds},
      jiraProjectIds
    },
    dateRange
  )

describe('buildInspirationSearchQuery for jira', () => {
  it('searches assigned issues by default', () => {
    expect(jiraQuery(['assigned'])).toBe(
      `assignee = currentUser() AND ${dateClause} order by updated DESC`
    )
  })

  it('searches only the issues the viewer created', () => {
    expect(jiraQuery(['created'])).toBe(
      `reporter = currentUser() AND ${dateClause} order by updated DESC`
    )
  })

  it('groups assigned and created so the date range applies to both', () => {
    expect(jiraQuery(['assigned', 'created'])).toBe(
      `(assignee = currentUser() OR reporter = currentUser()) AND ${dateClause} order by updated DESC`
    )
  })

  it('limits the search to the selected projects by key', () => {
    expect(jiraQuery(['assigned'], ['cloud-1:ENG', 'cloud-2:INFRA'])).toBe(
      `assignee = currentUser() AND project in ("ENG", "INFRA") AND ${dateClause} order by updated DESC`
    )
  })
})

describe('buildInspirationSearchQuery for azureDevOps', () => {
  it('sends the date range, the kinds and the chosen projects for the server to build the WIQL', () => {
    const projectIds = ['dev.azure.com/acme:6ce954b1-ce1f-45d1-b94d-e6bf2464ba2c']
    const searchQuery = buildInspirationSearchQuery(
      'azureDevOps',
      {
        ...DEFAULT_INSPIRATION_SOURCE_SETTINGS,
        kinds: {...DEFAULT_INSPIRATION_SOURCE_SETTINGS.kinds, azureDevOps: ['assigned', 'created']},
        azureDevOpsProjectIds: projectIds
      },
      dateRange
    )
    expect(JSON.parse(searchQuery)).toEqual({
      ...dateRange,
      kinds: ['assigned', 'created'],
      projectIds
    })
  })

  it('searches every shared project when none is chosen', () => {
    const searchQuery = buildInspirationSearchQuery(
      'azureDevOps',
      DEFAULT_INSPIRATION_SOURCE_SETTINGS,
      dateRange
    )
    expect(JSON.parse(searchQuery)).toMatchObject({kinds: ['assigned'], projectIds: []})
  })
})

describe('buildInspirationSearchQuery for clickup', () => {
  const clickUpRange = {startAt: '2026-10-01T00:00:00.000Z', endAt: '2026-10-07T23:59:59.999Z'}

  it('sends the date range and the chosen lists in the shape the server parses', () => {
    const searchQuery = buildInspirationSearchQuery(
      'clickup',
      {...DEFAULT_INSPIRATION_SOURCE_SETTINGS, clickupListIds: ['901423080038']},
      clickUpRange
    )
    expect(searchQuery).toBe(
      '{"startAt":"2026-10-01T00:00:00.000Z","endAt":"2026-10-07T23:59:59.999Z","listIds":["901423080038"]}'
    )
  })

  it('sends dates that parse back to the same instant', () => {
    const searchQuery = buildInspirationSearchQuery(
      'clickup',
      DEFAULT_INSPIRATION_SOURCE_SETTINGS,
      dateRange
    )
    const {startAt, endAt} = JSON.parse(searchQuery)
    expect(new Date(startAt).toISOString()).toBe(dateRange.startAt)
    expect(new Date(endAt).toISOString()).toBe(dateRange.endAt)
  })

  it('searches every list when none is chosen', () => {
    const searchQuery = buildInspirationSearchQuery(
      'clickup',
      DEFAULT_INSPIRATION_SOURCE_SETTINGS,
      clickUpRange
    )
    expect(JSON.parse(searchQuery)).toEqual({...clickUpRange, listIds: []})
  })
})

describe('withInspirationSourceDefaults', () => {
  it('fills settings saved before a field existed', () => {
    const stored = {
      kinds: {...DEFAULT_INSPIRATION_SOURCE_SETTINGS.kinds, jira: []},
      githubRepos: ['a/b']
    }
    expect(withInspirationSourceDefaults(stored)).toEqual({
      ...DEFAULT_INSPIRATION_SOURCE_SETTINGS,
      kinds: {...DEFAULT_INSPIRATION_SOURCE_SETTINGS.kinds, jira: []},
      githubRepos: ['a/b']
    })
  })
})
