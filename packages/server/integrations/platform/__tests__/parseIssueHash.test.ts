jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))

import {getServerIntegration} from '../registry'
import type {IntegrationCtx} from '../ServerIntegrationDefinition'

type StoredAuth = {accessToken: string; providerId: number} | null

const makeCtx = (auth: StoredAuth = null) =>
  ({
    teamId: 't1',
    userId: 'u1',
    dataLoader: {
      get: (name: string) => {
        if (name === 'teamMemberIntegrationAuthsByServiceTeamAndUserId') {
          return {load: jest.fn().mockResolvedValue(auth)}
        }
        throw new Error(`Unexpected loader ${name}`)
      }
    }
  }) as unknown as IntegrationCtx

const GID = 'gid://gitlab/Issue/123'
const LINEAR_ISSUE = 'c4a4c7e2-1111-4c2e-9b5a-000000000001'

describe('parseIssueHash never calls the vendor and returns only the issue parts', () => {
  it('github', async () => {
    expect(await getServerIntegration('github').parseIssueHash('ParabolInc/parabol:12')).toEqual({
      service: 'github',
      nameWithOwner: 'ParabolInc/parabol',
      issueNumber: 12
    })
  })

  it('github rejects a vendor node id and a non-positive number', async () => {
    const github = getServerIntegration('github')
    expect(await github.parseIssueHash('I_kwDOABCD')).toBeNull()
    expect(await github.parseIssueHash('ParabolInc/parabol:0')).toBeNull()
    expect(await github.parseIssueHash(':12')).toBeNull()
  })

  it('gitlab', async () => {
    expect(
      await getServerIntegration('gitlab').parseIssueHash(
        `integrationProvider:7::${GID}`,
        makeCtx({accessToken: 'tok', providerId: 7})
      )
    ).toEqual({
      service: 'gitlab',
      providerId: 'integrationProvider:7',
      gid: GID
    })
  })

  it('gitlab rejects a provider the viewer does not hold, a bare gid, and extra segments', async () => {
    const gitlab = getServerIntegration('gitlab')
    const ctx = makeCtx({accessToken: 'tok', providerId: 7})
    expect(await gitlab.parseIssueHash(`integrationProvider:99::${GID}`, ctx)).toBeNull()
    expect(await gitlab.parseIssueHash(`integrationProvider:7::${GID}`, makeCtx(null))).toBeNull()
    expect(await gitlab.parseIssueHash(GID, ctx)).toBeNull()
    expect(await gitlab.parseIssueHash(`integrationProvider:7::${GID}::extra`, ctx)).toBeNull()
  })

  it('linear', async () => {
    expect(
      await getServerIntegration('linear').parseIssueHash(`team1:proj1::${LINEAR_ISSUE}`)
    ).toEqual({
      service: 'linear',
      repoId: 'team1:proj1',
      issueId: LINEAR_ISSUE
    })
  })

  it('linear keys a team-only repo on the team id alone', async () => {
    const res = await getServerIntegration('linear').parseIssueHash(`team1::${LINEAR_ISSUE}`)
    expect(res).toMatchObject({repoId: 'team1', issueId: LINEAR_ISSUE})
  })

  it('linear rejects a vendor node id and an empty part', async () => {
    const linear = getServerIntegration('linear')
    expect(await linear.parseIssueHash(LINEAR_ISSUE)).toBeNull()
    expect(await linear.parseIssueHash(`::${LINEAR_ISSUE}`)).toBeNull()
    expect(await linear.parseIssueHash('team1::')).toBeNull()
  })

  it('jira', async () => {
    expect(await getServerIntegration('jira').parseIssueHash('cloud1:WEB-12')).toEqual({
      service: 'jira',
      cloudId: 'cloud1',
      issueKey: 'WEB-12',
      projectKey: 'WEB'
    })
  })

  it('jira rejects a missing cloud id and empty parts', async () => {
    const jira = getServerIntegration('jira')
    expect(await jira.parseIssueHash('WEB-12')).toBeNull()
    expect(await jira.parseIssueHash(':WEB-12')).toBeNull()
    expect(await jira.parseIssueHash('cloud1:')).toBeNull()
  })

  it('jiraServer', async () => {
    expect(
      await getServerIntegration('jiraServer').parseIssueHash(
        '9:10001:10555',
        makeCtx({accessToken: 'tok', providerId: 9})
      )
    ).toEqual({
      service: 'jiraServer',
      providerId: 9,
      repositoryId: '10001',
      issueId: '10555'
    })
  })

  it('jiraServer rejects a provider the viewer does not hold, no auth, and bad shapes', async () => {
    const jiraServer = getServerIntegration('jiraServer')
    expect(
      await jiraServer.parseIssueHash('9:10001:10555', makeCtx({accessToken: 'tok', providerId: 8}))
    ).toBeNull()
    expect(await jiraServer.parseIssueHash('9:10001:10555', makeCtx(null))).toBeNull()
    expect(await jiraServer.parseIssueHash('nope', makeCtx())).toBeNull()
    expect(
      await jiraServer.parseIssueHash(
        '9:10001:10555:extra',
        makeCtx({accessToken: 'tok', providerId: 9})
      )
    ).toBeNull()
  })

  it('azureDevOps', async () => {
    expect(
      await getServerIntegration('azureDevOps').parseIssueHash('dev.azure.com/acme:Web:42')
    ).toEqual({
      service: 'azureDevOps',
      instanceId: 'dev.azure.com/acme',
      projectKey: 'Web',
      issueKey: '42'
    })
  })

  it('azureDevOps rejects too few parts and a foreign host', async () => {
    const azure = getServerIntegration('azureDevOps')
    expect(await azure.parseIssueHash('instance:42')).toBeNull()
    expect(await azure.parseIssueHash('42')).toBeNull()
    expect(await azure.parseIssueHash('evil.example.com/acme:Web:42')).toBeNull()
  })
})
