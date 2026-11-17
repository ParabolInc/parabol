import {Response} from '@whatwg-node/fetch'
import type {User} from '../../../../../postgres/types'
import type {IntegrationProviderMSTeams} from '../../../../../postgres/types/IntegrationProvider'
import {postUntrusted} from '../../../../../utils/fetchUntrusted'
import {Logger} from '../../../../../utils/Logger'
import type {DataLoaderWorker} from '../../../../graphql'
import {MSTeamsNotifier} from '../MSTeamsNotifier'

jest.mock('../../../../../utils/fetchUntrusted', () => ({postUntrusted: jest.fn()}))
jest.mock('parabol-client/utils/meetings/lookups', () => ({phaseLabelLookup: {}}))

const user = {id: 'user1', email: 'user1@example.com'} as User
const provider = {
  id: 1,
  service: 'msTeams',
  teamId: 'team1',
  webhookUrl: 'https://teams.microsoft.com/v2/'
} as IntegrationProviderMSTeams
const loaders = {
  teamMemberIntegrationAuthsByTeamIdAndService: {load: async () => [{providerId: provider.id}]},
  users: {load: async () => user, loadNonNull: async () => user},
  integrationProviders: {loadNonNull: async () => provider},
  teamNotificationSettingsByProviderIdAndTeamId: {
    load: async () => [{channelId: null, events: ['meetingEnd']}]
  }
}
const dataLoader = {
  get: (name: keyof typeof loaders) => loaders[name]
} as unknown as DataLoaderWorker

describe('MSTeamsNotifier', () => {
  it('warns instead of logging an error when the saved link is not a webhook', async () => {
    jest
      .mocked(postUntrusted)
      .mockResolvedValue(new Response(null, {status: 405, statusText: 'Method Not Allowed'}))
    const error = jest.spyOn(Logger, 'error').mockImplementation()
    const warned = new Promise<unknown[]>((resolve) => {
      jest.spyOn(Logger, 'warn').mockImplementation((...args) => resolve(args))
    })

    await MSTeamsNotifier.integrationUpdated(dataLoader, 'team1', 'user1')

    expect(await warned).toEqual([
      expect.objectContaining({message: '405: Method Not Allowed'}),
      {
        userId: 'user1',
        tags: {teamId: 'team1', event: 'meetingEnd', host: 'teams.microsoft.com'}
      }
    ])
    expect(error).not.toHaveBeenCalled()
  })
})
