import type SlackAuth from '../../../../../database/types/SlackAuth'
import type {SlackNotificationAuth} from '../../../../../dataloader/integrationAuthLoaders'
import getKysely from '../../../../../postgres/getKysely'
import type {Team, User} from '../../../../../postgres/types'
import type {AnyMeeting} from '../../../../../postgres/types/Meeting'
import logError from '../../../../../utils/logError'
import SlackServerManager from '../../../../../utils/SlackServerManager'
import removeSlackAuths from '../../removeSlackAuths'
import {SlackSingleChannelNotifier} from '../SlackNotifier'

jest.mock('../../../../../utils/SlackServerManager')
jest.mock('../../../../../utils/logError')
jest.mock('../../../../../postgres/getKysely')
jest.mock('../../removeSlackAuths')
jest.mock('parabol-client/utils/meetings/lookups', () => ({phaseLabelLookup: {}}))

const mockPostMessage = jest.fn()
const mockJoinConversation = jest.fn()
jest.mocked(SlackServerManager).mockImplementation(
  () =>
    ({
      postMessage: mockPostMessage,
      joinConversation: mockJoinConversation
    }) as unknown as SlackServerManager
)

const mockSet = jest.fn()
const mockExecute = jest.fn()
const updateQuery = {
  set: (...args: unknown[]) => {
    mockSet(...args)
    return updateQuery
  },
  where: () => updateQuery,
  execute: mockExecute
}
const mockUpdateTable = jest.fn(() => updateQuery)
jest.mocked(getKysely).mockReturnValue({
  updateTable: mockUpdateTable
} as unknown as ReturnType<typeof getKysely>)

const notificationChannel = {
  channelId: 'C0000000001',
  teamId: 'team1',
  auth: {id: 'auth1', botAccessToken: 'xoxb-token', userId: 'user1', teamId: 'team1'} as SlackAuth
} as SlackNotificationAuth
const team = {id: 'team1', name: 'Team One'} as Team
const meeting = {
  id: 'meeting1',
  name: 'Retro 1',
  meetingType: 'retrospective'
} as AnyMeeting
const user = {id: 'user1'} as User

describe('SlackSingleChannelNotifier', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('stops notifying a channel that was archived without logging an error', async () => {
    mockPostMessage.mockResolvedValue({ok: false, error: 'is_archived'})
    const res = await SlackSingleChannelNotifier(notificationChannel).startMeeting(
      meeting,
      team,
      user
    )
    expect(res).toEqual({error: new Error('is_archived')})
    expect(mockUpdateTable).toHaveBeenCalledWith('SlackNotification')
    expect(mockSet).toHaveBeenCalledWith({channelId: null})
    expect(logError).not.toHaveBeenCalled()
  })

  it('stops notifying a channel that no longer exists without logging an error', async () => {
    mockPostMessage.mockResolvedValue({ok: false, error: 'channel_not_found'})
    const res = await SlackSingleChannelNotifier(notificationChannel).startMeeting(
      meeting,
      team,
      user
    )
    expect(res).toEqual({error: new Error('channel_not_found')})
    expect(mockSet).toHaveBeenCalledWith({channelId: null})
    expect(logError).not.toHaveBeenCalled()
  })

  it.each(['account_inactive', 'token_revoked'])(
    'deactivates the Slack auth without logging an error when Slack answers %s',
    async (error) => {
      mockPostMessage.mockResolvedValue({ok: false, error})
      const res = await SlackSingleChannelNotifier(notificationChannel).startMeeting(
        meeting,
        team,
        user
      )
      expect(res).toEqual({error: new Error(error)})
      expect(removeSlackAuths).toHaveBeenCalledWith('user1', 'team1', true)
      expect(logError).not.toHaveBeenCalled()
    }
  )

  it('logs unexpected errors and keeps the channel', async () => {
    mockPostMessage.mockResolvedValue({ok: false, error: 'ratelimited'})
    const res = await SlackSingleChannelNotifier(notificationChannel).startMeeting(
      meeting,
      team,
      user
    )
    expect(res).toEqual({error: new Error('ratelimited')})
    expect(mockSet).not.toHaveBeenCalled()
    expect(removeSlackAuths).not.toHaveBeenCalled()
    expect(logError).toHaveBeenCalled()
  })
})
