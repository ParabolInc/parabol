import type {GraphQLResolveInfo} from 'graphql'
import upsertIntegrationProvider from '../../../../postgres/queries/upsertIntegrationProvider'
import type {GQLContext} from '../../../graphql'
import addIntegrationProvider from '../addIntegrationProvider'

jest.mock('../../../../postgres/queries/upsertIntegrationProvider', () => ({
  __esModule: true,
  default: jest.fn(async () => 1)
}))
jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))

const teamId = 'team1'
const context = {
  authToken: {sub: 'viewer1', tms: [teamId]},
  socketId: 'socket1',
  dataLoader: {share: () => 'op'}
} as unknown as GQLContext
const info = {} as GraphQLResolveInfo

const resolve = addIntegrationProvider
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const addMSTeams = (webhookUrl: string) =>
  resolve(
    {},
    {
      input: {
        scope: 'team',
        service: 'msTeams',
        teamId,
        authStrategy: 'webhook',
        webhookProviderMetadataInput: {webhookUrl}
      }
    },
    context,
    info
  )

describe('addIntegrationProvider', () => {
  it.each([
    'https://teams.microsoft.com/v2/',
    'https://teams.microsoft.com/l/channel/19%3Aabc%40thread.tacv2/General?groupId=123',
    'https://teams.cloud.microsoft/'
  ])('refuses the Teams app link %s as an MS Teams webhook', async (webhookUrl) => {
    await expect(addMSTeams(webhookUrl)).rejects.toMatchObject({
      extensions: {code: 'BAD_USER_INPUT'}
    })
    expect(upsertIntegrationProvider).not.toHaveBeenCalled()
  })

  it('saves an MS Teams webhook', async () => {
    await addMSTeams('https://example.webhook.office.com/webhookb2/abc/IncomingWebhook/def')
    expect(upsertIntegrationProvider).toHaveBeenCalledTimes(1)
  })
})
