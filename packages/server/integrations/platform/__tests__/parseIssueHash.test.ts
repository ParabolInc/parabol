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

describe('parseIssueHash returns only the issue parts', () => {
  it('github', () => {
    expect(getServerIntegration('github').parseIssueHash('ParabolInc/parabol:12')).toEqual({
      service: 'github',
      nameWithOwner: 'ParabolInc/parabol',
      issueNumber: 12
    })
  })

  it('github rejects a vendor node id and a non-positive number', () => {
    const github = getServerIntegration('github')
    expect(github.parseIssueHash('I_kwDOABCD')).toBeNull()
    expect(github.parseIssueHash('ParabolInc/parabol:0')).toBeNull()
    expect(github.parseIssueHash(':12')).toBeNull()
  })

  it('gitlab', () => {
    expect(getServerIntegration('gitlab').parseIssueHash(`integrationProvider:7::${GID}`)).toEqual({
      service: 'gitlab',
      providerId: 'integrationProvider:7',
      gid: GID
    })
  })

  it('gitlab rejects a bare gid and extra segments', () => {
    const gitlab = getServerIntegration('gitlab')
    expect(gitlab.parseIssueHash(GID)).toBeNull()
    expect(gitlab.parseIssueHash(`integrationProvider:7::${GID}::extra`)).toBeNull()
  })

  it('linear', () => {
    expect(getServerIntegration('linear').parseIssueHash(`team1:proj1::${LINEAR_ISSUE}`)).toEqual({
      service: 'linear',
      repoId: 'team1:proj1',
      issueId: LINEAR_ISSUE
    })
  })

  it('linear keys a team-only repo on the team id alone', () => {
    const res = getServerIntegration('linear').parseIssueHash(`team1::${LINEAR_ISSUE}`)
    expect(res).toMatchObject({repoId: 'team1', issueId: LINEAR_ISSUE})
  })

  it('linear rejects a vendor node id and an empty part', () => {
    const linear = getServerIntegration('linear')
    expect(linear.parseIssueHash(LINEAR_ISSUE)).toBeNull()
    expect(linear.parseIssueHash(`::${LINEAR_ISSUE}`)).toBeNull()
    expect(linear.parseIssueHash('team1::')).toBeNull()
  })

  it('jira', () => {
    expect(getServerIntegration('jira').parseIssueHash('cloud1:WEB-12')).toEqual({
      service: 'jira',
      cloudId: 'cloud1',
      issueKey: 'WEB-12',
      projectKey: 'WEB'
    })
  })

  it('jira rejects a missing cloud id and empty parts', () => {
    const jira = getServerIntegration('jira')
    expect(jira.parseIssueHash('WEB-12')).toBeNull()
    expect(jira.parseIssueHash(':WEB-12')).toBeNull()
    expect(jira.parseIssueHash('cloud1:')).toBeNull()
  })

  it('jiraServer', () => {
    expect(getServerIntegration('jiraServer').parseIssueHash('9:10001:10555')).toEqual({
      service: 'jiraServer',
      providerId: 9,
      repositoryId: '10001',
      issueId: '10555'
    })
  })

  it('jiraServer rejects bad shapes', () => {
    const jiraServer = getServerIntegration('jiraServer')
    expect(jiraServer.parseIssueHash('nope')).toBeNull()
    expect(jiraServer.parseIssueHash('9:10001:10555:extra')).toBeNull()
  })

  it('azureDevOps', () => {
    expect(getServerIntegration('azureDevOps').parseIssueHash('dev.azure.com/acme:Web:42')).toEqual(
      {
        service: 'azureDevOps',
        instanceId: 'dev.azure.com/acme',
        projectKey: 'Web',
        issueKey: '42'
      }
    )
  })

  it('azureDevOps rejects too few parts and a foreign host', () => {
    const azure = getServerIntegration('azureDevOps')
    expect(azure.parseIssueHash('instance:42')).toBeNull()
    expect(azure.parseIssueHash('42')).toBeNull()
    expect(azure.parseIssueHash('evil.example.com/acme:Web:42')).toBeNull()
  })
})
