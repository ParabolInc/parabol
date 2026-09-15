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

describe('parseIssueHash never calls the vendor and returns the stored parts', () => {
  it('github', async () => {
    expect(
      await getServerIntegration('github').parseIssueHash(makeCtx(), 'ParabolInc/parabol:12')
    ).toEqual({
      accessUserId: 'u1',
      service: 'github',
      nameWithOwner: 'ParabolInc/parabol',
      issueNumber: 12
    })
  })

  it('github rejects a vendor node id and a non-positive number', async () => {
    const github = getServerIntegration('github')
    expect(await github.parseIssueHash(makeCtx(), 'I_kwDOABCD')).toBeNull()
    expect(await github.parseIssueHash(makeCtx(), 'ParabolInc/parabol:0')).toBeNull()
    expect(await github.parseIssueHash(makeCtx(), ':12')).toBeNull()
  })

  it('gitlab', async () => {
    expect(
      await getServerIntegration('gitlab').parseIssueHash(
        makeCtx({accessToken: 'tok', providerId: 7}),
        `integrationProvider:7::${GID}`
      )
    ).toEqual({
      accessUserId: 'u1',
      service: 'gitlab',
      providerId: 'integrationProvider:7',
      gid: GID
    })
  })

  it('gitlab rejects a provider the viewer does not hold, a bare gid, and extra segments', async () => {
    const gitlab = getServerIntegration('gitlab')
    const ctx = makeCtx({accessToken: 'tok', providerId: 7})
    expect(await gitlab.parseIssueHash(ctx, `integrationProvider:99::${GID}`)).toBeNull()
    expect(await gitlab.parseIssueHash(makeCtx(null), `integrationProvider:7::${GID}`)).toBeNull()
    expect(await gitlab.parseIssueHash(ctx, GID)).toBeNull()
    expect(await gitlab.parseIssueHash(ctx, `integrationProvider:7::${GID}::extra`)).toBeNull()
  })

  it('linear', async () => {
    expect(
      await getServerIntegration('linear').parseIssueHash(makeCtx(), `team1:proj1::${LINEAR_ISSUE}`)
    ).toEqual({
      accessUserId: 'u1',
      service: 'linear',
      repoId: 'team1:proj1',
      issueId: LINEAR_ISSUE
    })
  })

  it('linear keys a team-only repo on the team id alone', async () => {
    const res = await getServerIntegration('linear').parseIssueHash(
      makeCtx(),
      `team1::${LINEAR_ISSUE}`
    )
    expect(res).toMatchObject({repoId: 'team1', issueId: LINEAR_ISSUE})
  })

  it('linear rejects a vendor node id and an empty part', async () => {
    const linear = getServerIntegration('linear')
    expect(await linear.parseIssueHash(makeCtx(), LINEAR_ISSUE)).toBeNull()
    expect(await linear.parseIssueHash(makeCtx(), `::${LINEAR_ISSUE}`)).toBeNull()
    expect(await linear.parseIssueHash(makeCtx(), 'team1::')).toBeNull()
  })

  it('jira', async () => {
    expect(await getServerIntegration('jira').parseIssueHash(makeCtx(), 'cloud1:WEB-12')).toEqual({
      accessUserId: 'u1',
      service: 'jira',
      cloudId: 'cloud1',
      issueKey: 'WEB-12',
      projectKey: 'WEB'
    })
  })

  it('jira rejects a missing cloud id and empty parts', async () => {
    const jira = getServerIntegration('jira')
    expect(await jira.parseIssueHash(makeCtx(), 'WEB-12')).toBeNull()
    expect(await jira.parseIssueHash(makeCtx(), ':WEB-12')).toBeNull()
    expect(await jira.parseIssueHash(makeCtx(), 'cloud1:')).toBeNull()
  })

  it('jiraServer', async () => {
    expect(
      await getServerIntegration('jiraServer').parseIssueHash(
        makeCtx({accessToken: 'tok', providerId: 9}),
        '9:10001:10555'
      )
    ).toEqual({
      accessUserId: 'u1',
      service: 'jiraServer',
      providerId: 9,
      repositoryId: '10001',
      issueId: '10555'
    })
  })

  it('jiraServer rejects a provider the viewer does not hold, no auth, and bad shapes', async () => {
    const jiraServer = getServerIntegration('jiraServer')
    expect(
      await jiraServer.parseIssueHash(makeCtx({accessToken: 'tok', providerId: 8}), '9:10001:10555')
    ).toBeNull()
    expect(await jiraServer.parseIssueHash(makeCtx(null), '9:10001:10555')).toBeNull()
    expect(await jiraServer.parseIssueHash(makeCtx(), 'nope')).toBeNull()
    expect(
      await jiraServer.parseIssueHash(
        makeCtx({accessToken: 'tok', providerId: 9}),
        '9:10001:10555:extra'
      )
    ).toBeNull()
  })

  it('azureDevOps', async () => {
    expect(
      await getServerIntegration('azureDevOps').parseIssueHash(
        makeCtx(),
        'dev.azure.com/acme:Web:42'
      )
    ).toEqual({
      accessUserId: 'u1',
      service: 'azureDevOps',
      instanceId: 'dev.azure.com/acme',
      projectKey: 'Web',
      issueKey: '42'
    })
  })

  it('azureDevOps rejects too few parts and a foreign host', async () => {
    const azure = getServerIntegration('azureDevOps')
    expect(await azure.parseIssueHash(makeCtx(), 'instance:42')).toBeNull()
    expect(await azure.parseIssueHash(makeCtx(), '42')).toBeNull()
    expect(await azure.parseIssueHash(makeCtx(), 'evil.example.com/acme:Web:42')).toBeNull()
  })
})
