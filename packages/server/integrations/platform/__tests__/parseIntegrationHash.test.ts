jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))

import {getServerIntegration} from '../registry'

const GID = 'gid://gitlab/Issue/123'
const LINEAR_ISSUE = 'c4a4c7e2-1111-4c2e-9b5a-000000000001'

describe('parseIntegrationHash returns only the issue parts', () => {
  it('github', () => {
    expect(getServerIntegration('github').parseIntegrationHash('ParabolInc/parabol:12')).toEqual({
      service: 'github',
      nameWithOwner: 'ParabolInc/parabol',
      issueNumber: 12
    })
  })

  it('github rejects a vendor node id and a non-positive number', () => {
    const github = getServerIntegration('github')
    expect(github.parseIntegrationHash('I_kwDOABCD')).toBeNull()
    expect(github.parseIntegrationHash('ParabolInc/parabol:0')).toBeNull()
    expect(github.parseIntegrationHash(':12')).toBeNull()
  })

  it('gitlab', () => {
    expect(
      getServerIntegration('gitlab').parseIntegrationHash(`integrationProvider:7::${GID}`)
    ).toEqual({
      service: 'gitlab',
      providerId: 'integrationProvider:7',
      gid: GID
    })
  })

  it('gitlab rejects a bare gid and extra segments', () => {
    const gitlab = getServerIntegration('gitlab')
    expect(gitlab.parseIntegrationHash(GID)).toBeNull()
    expect(gitlab.parseIntegrationHash(`integrationProvider:7::${GID}::extra`)).toBeNull()
  })

  it('linear', () => {
    expect(
      getServerIntegration('linear').parseIntegrationHash(`team1:proj1::${LINEAR_ISSUE}`)
    ).toEqual({
      service: 'linear',
      repoId: 'team1:proj1',
      issueId: LINEAR_ISSUE
    })
  })

  it('linear keys a team-only repo on the team id alone', () => {
    const res = getServerIntegration('linear').parseIntegrationHash(`team1::${LINEAR_ISSUE}`)
    expect(res).toMatchObject({repoId: 'team1', issueId: LINEAR_ISSUE})
  })

  it('linear rejects a vendor node id and an empty part', () => {
    const linear = getServerIntegration('linear')
    expect(linear.parseIntegrationHash(LINEAR_ISSUE)).toBeNull()
    expect(linear.parseIntegrationHash(`::${LINEAR_ISSUE}`)).toBeNull()
    expect(linear.parseIntegrationHash('team1::')).toBeNull()
  })

  it('jira', () => {
    expect(getServerIntegration('jira').parseIntegrationHash('cloud1:WEB-12')).toEqual({
      service: 'jira',
      cloudId: 'cloud1',
      issueKey: 'WEB-12',
      projectKey: 'WEB'
    })
  })

  it('jira rejects a missing cloud id and empty parts', () => {
    const jira = getServerIntegration('jira')
    expect(jira.parseIntegrationHash('WEB-12')).toBeNull()
    expect(jira.parseIntegrationHash(':WEB-12')).toBeNull()
    expect(jira.parseIntegrationHash('cloud1:')).toBeNull()
  })

  it('jiraServer', () => {
    expect(getServerIntegration('jiraServer').parseIntegrationHash('9:10001:10555')).toEqual({
      service: 'jiraServer',
      providerId: 9,
      repositoryId: '10001',
      issueId: '10555'
    })
  })

  it('jiraServer rejects bad shapes', () => {
    const jiraServer = getServerIntegration('jiraServer')
    expect(jiraServer.parseIntegrationHash('nope')).toBeNull()
    expect(jiraServer.parseIntegrationHash('9:10001:10555:extra')).toBeNull()
  })

  it('azureDevOps', () => {
    expect(
      getServerIntegration('azureDevOps').parseIntegrationHash('dev.azure.com/acme:Web:42')
    ).toEqual({
      service: 'azureDevOps',
      instanceId: 'dev.azure.com/acme',
      projectKey: 'Web',
      issueKey: '42'
    })
  })

  it('azureDevOps rejects too few parts and a foreign host', () => {
    const azure = getServerIntegration('azureDevOps')
    expect(azure.parseIntegrationHash('instance:42')).toBeNull()
    expect(azure.parseIntegrationHash('42')).toBeNull()
    expect(azure.parseIntegrationHash('evil.example.com/acme:Web:42')).toBeNull()
  })
})
