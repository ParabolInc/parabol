import {Response} from '@whatwg-node/fetch'
import type {User} from '../../../../../postgres/types'
import {postUntrusted} from '../../../../../utils/fetchUntrusted'
import {Logger} from '../../../../../utils/Logger'
import {type MSTeamsNotificationAuth, MSTeamsNotificationHelper} from '../MSTeamsNotifier'

jest.mock('../../../../../utils/fetchUntrusted', () => ({postUntrusted: jest.fn()}))
jest.mock('parabol-client/utils/meetings/lookups', () => ({phaseLabelLookup: {}}))

const notificationChannel = {
  webhookUrl: 'https://teams.microsoft.com/v2/',
  teamId: 'team1',
  userId: 'user1'
} as MSTeamsNotificationAuth
const user = {id: 'user1'} as User

describe('MSTeamsNotificationHelper', () => {
  it('warns instead of logging an error when the saved link is not a webhook', async () => {
    jest
      .mocked(postUntrusted)
      .mockResolvedValue(new Response(null, {status: 405, statusText: 'Method Not Allowed'}))
    const warn = jest.spyOn(Logger, 'warn').mockImplementation()
    const error = jest.spyOn(Logger, 'error').mockImplementation()

    const res = await MSTeamsNotificationHelper(notificationChannel).integrationUpdated(user)

    expect(res).toEqual({error: expect.objectContaining({message: '405: Method Not Allowed'})})
    expect(error).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(expect.any(Error), {
      userId: 'user1',
      tags: {teamId: 'team1', event: 'meetingEnd', host: 'teams.microsoft.com'}
    })
  })
})
