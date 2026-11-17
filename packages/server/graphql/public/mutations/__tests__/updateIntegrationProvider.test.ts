import type {GraphQLResolveInfo} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import type {GQLContext} from '../../../graphql'
import updateIntegrationProvider from '../updateIntegrationProvider'

const mockUpdateTable = jest.fn()
jest.mock('../../../../postgres/getKysely', () => {
  const builder = {
    selectAll: () => builder,
    set: () => builder,
    where: () => builder,
    executeTakeFirst: async () => ({
      id: 1,
      service: 'msTeams',
      authStrategy: 'webhook',
      scope: 'team',
      teamId: 'team1',
      orgId: null,
      webhookUrl: 'https://example.webhook.office.com/webhookb2/abc/IncomingWebhook/def'
    }),
    execute: async () => []
  }
  const kysely = {
    selectFrom: () => builder,
    updateTable: (...args: unknown[]) => {
      mockUpdateTable(...args)
      return builder
    }
  }
  return {__esModule: true, default: () => kysely}
})
jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../mutations/helpers/notifications/MattermostNotifier', () => ({}))
jest.mock('../../../mutations/helpers/notifications/MSTeamsNotifier', () => ({}))

const teamId = 'team1'
const context = {
  authToken: {sub: 'viewer1', tms: [teamId]},
  socketId: 'socket1',
  dataLoader: {
    share: () => 'op',
    get: () => ({load: async () => ({id: teamId, orgId: 'org1'})})
  }
} as unknown as GQLContext
const info = {} as GraphQLResolveInfo

const resolve = updateIntegrationProvider
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

describe('updateIntegrationProvider', () => {
  it('refuses to change an MS Teams webhook to a Teams app link', async () => {
    const update = resolve(
      {},
      {
        provider: {
          id: IntegrationProviderId.join(1),
          scope: 'team',
          teamId,
          webhookProviderMetadataInput: {webhookUrl: 'https://teams.microsoft.com/l/team/19%3Aabc'}
        }
      },
      context,
      info
    )
    await expect(update).rejects.toMatchObject({extensions: {code: 'BAD_USER_INPUT'}})
    expect(mockUpdateTable).not.toHaveBeenCalled()
  })
})
