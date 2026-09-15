jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))

import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql/graphql'
import type {GqlIntegrationCtx} from '../../platform/ServerIntegrationDefinition'
import {JiraServerIntegration} from '../JiraServerIntegration'

const JIRA_SCOPES = 'offline_access read:jira-user read:jira-work write:jira-work'
const CONFLUENCE_ONLY = 'offline_access read:confluence-content.all write:confluence-content'

const makeCtx = (scope: string) => {
  const freshLoad = jest.fn().mockResolvedValue({accessToken: 'tok', scope, scopes: scope})
  const rowLoad = jest.fn().mockResolvedValue({accessToken: 'tok', scopes: scope})
  const ctx = {
    teamId: 't1',
    userId: 'u1',
    context: {} as GQLContext,
    info: {} as GraphQLResolveInfo,
    dataLoader: {
      get: (name: string) => {
        if (name === 'freshAtlassianAuth') return {load: freshLoad}
        if (name === 'teamMemberIntegrationAuthsByServiceTeamAndUserId') return {load: rowLoad}
        throw new Error(`Unexpected loader ${name}`)
      }
    }
  } as unknown as GqlIntegrationCtx
  return {ctx, rowLoad}
}

const jira = new JiraServerIntegration()

test('a Confluence-only grant is not usable for Jira anywhere', async () => {
  const {ctx} = makeCtx(CONFLUENCE_ONLY)
  await expect(jira.resolveAuth(ctx)).resolves.toBeNull()
  await expect(jira.getAuthRow(ctx)).resolves.toBeNull()
  await expect(jira.isConnected(ctx)).resolves.toBe(false)
  await expect(jira.capabilities.issueCreate.initManager(ctx)).resolves.toBeNull()
})

test('a grant with the Jira scopes is usable everywhere', async () => {
  const {ctx} = makeCtx(JIRA_SCOPES)
  await expect(jira.resolveAuth(ctx)).resolves.toMatchObject({accessToken: 'tok'})
  await expect(jira.getAuthRow(ctx)).resolves.toMatchObject({accessToken: 'tok'})
  await expect(jira.isConnected(ctx)).resolves.toBe(true)
  await expect(jira.capabilities.issueCreate.initManager(ctx)).resolves.not.toBeNull()
})

test('a Confluence-only grant still exposes its scopes via the raw loader row, even though getAuthRow hides it', async () => {
  const confluenceOnlyScopes = 'read:confluence-space.summary offline_access'
  const {ctx, rowLoad} = makeCtx(confluenceOnlyScopes)
  await expect(jira.getAuthRow(ctx)).resolves.toBeNull()
  expect(rowLoad).toHaveBeenCalledWith(expect.objectContaining({service: 'jira'}))
  await expect(jira.isConnected(ctx)).resolves.toBe(false)
})
