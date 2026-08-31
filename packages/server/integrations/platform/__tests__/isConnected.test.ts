jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))

import {serverIntegrations} from '../registry'
import type {IntegrationCtx} from '../ServerIntegrationDefinition'

const makeCtx = (auth: {accessToken: string | null; scopes?: string | null} | null) => {
  const load = jest.fn().mockResolvedValue(auth)
  const ctx: IntegrationCtx = {
    teamId: 'team1',
    userId: 'user1',
    dataLoader: {
      get: jest.fn((loaderName: string) => {
        if (loaderName === 'teamMemberIntegrationAuthsByServiceTeamAndUserId') return {load}
        throw new Error(`Unexpected loader ${loaderName}`)
      })
    } as unknown as IntegrationCtx['dataLoader']
  }
  return {ctx, load}
}

const JIRA_SCOPES = 'offline_access read:jira-user read:jira-work write:jira-work'
const CONFLUENCE_ONLY_SCOPES = 'offline_access read:confluence-content.all write:confluence-content'

describe('isConnected', () => {
  it('github is connected by an active row with a token', async () => {
    const {ctx, load} = makeCtx({accessToken: 'token'})
    await expect(serverIntegrations.github.isConnected(ctx)).resolves.toBe(true)
    expect(load).toHaveBeenCalledWith({service: 'github', teamId: 'team1', userId: 'user1'})
  })

  it('github is not connected without a row', async () => {
    await expect(serverIntegrations.github.isConnected(makeCtx(null).ctx)).resolves.toBe(false)
  })

  it('jira is connected when the grant carries the Jira scopes', async () => {
    const {ctx} = makeCtx({accessToken: 'token', scopes: JIRA_SCOPES})
    await expect(serverIntegrations.jira.isConnected(ctx)).resolves.toBe(true)
  })

  it('jira is not connected by a Confluence-only grant', async () => {
    const {ctx} = makeCtx({accessToken: 'token', scopes: CONFLUENCE_ONLY_SCOPES})
    await expect(serverIntegrations.jira.isConnected(ctx)).resolves.toBe(false)
  })

  it('jira is not connected without scopes or a row', async () => {
    await expect(
      serverIntegrations.jira.isConnected(makeCtx({accessToken: 'token', scopes: null}).ctx)
    ).resolves.toBe(false)
    await expect(serverIntegrations.jira.isConnected(makeCtx(null).ctx)).resolves.toBe(false)
  })
})
