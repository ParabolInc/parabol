import type SlackAuth from '../../../../../database/types/SlackAuth'
import type {SlackNotificationAuth} from '../../../../../dataloader/integrationAuthLoaders'
import generateUID from '../../../../../generateUID'
import getKysely from '../../../../../postgres/getKysely'
import type {Team, User} from '../../../../../postgres/types'
import type {AnyMeeting} from '../../../../../postgres/types/Meeting'
import getRedis from '../../../../../utils/getRedis'
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
const mockUpdateMessage = jest.fn()
jest.mocked(SlackServerManager).mockImplementation(
  () =>
    ({
      postMessage: mockPostMessage,
      joinConversation: mockJoinConversation,
      updateMessage: mockUpdateMessage
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

describe('SlackSingleChannelNotifier on a renamed meeting', () => {
  const dmChannel = {...notificationChannel, channelId: 'U0000000001'} as SlackNotificationAuth
  const startedMeetingIds: string[] = []
  const startMeetingIn = async (channels: {channel: SlackNotificationAuth; ts: string}[]) => {
    const startedMeeting = {...meeting, id: generateUID()} as AnyMeeting
    startedMeetingIds.push(startedMeeting.id)
    for (const {channel, ts} of channels) {
      const postedChannel = channel.channelId!.replace(/^U/, 'D')
      mockPostMessage.mockResolvedValueOnce({ok: true, channel: postedChannel, ts})
      await SlackSingleChannelNotifier(channel).startMeeting(startedMeeting, team, user)
    }
    return startedMeeting
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await getRedis().del(...startedMeetingIds.map((id) => `slackMeetingStartMessages:${id}`))
    await getRedis().quit()
  })

  it('edits the message each channel was sent, where Slack posted it', async () => {
    mockUpdateMessage.mockResolvedValue({ok: true})
    const startedMeeting = await startMeetingIn([
      {channel: notificationChannel, ts: '1731340000.123450'},
      {channel: dmChannel, ts: '1731340001.000100'}
    ])
    await SlackSingleChannelNotifier(notificationChannel).updateMeeting!(startedMeeting, team, user)
    await SlackSingleChannelNotifier(dmChannel).updateMeeting!(startedMeeting, team, user)
    expect(mockUpdateMessage).toHaveBeenCalledTimes(2)
    expect(mockUpdateMessage).toHaveBeenCalledWith(
      'C0000000001',
      expect.anything(),
      '1731340000.123450'
    )
    expect(mockUpdateMessage).toHaveBeenCalledWith(
      'D0000000001',
      expect.anything(),
      '1731340001.000100'
    )
  })

  it('keeps where the start messages landed for a day', async () => {
    const startedMeeting = await startMeetingIn([
      {channel: notificationChannel, ts: '1731340000.123450'}
    ])
    const ttl = await getRedis().ttl(`slackMeetingStartMessages:${startedMeeting.id}`)
    expect(ttl).toBeGreaterThan(60 * 60 * 23)
    expect(ttl).toBeLessThanOrEqual(60 * 60 * 24)
  })

  it('leaves Slack alone when no start message is stored for the channel', async () => {
    const startedMeeting = await startMeetingIn([{channel: dmChannel, ts: '1731340001.000100'}])
    const res = await SlackSingleChannelNotifier(notificationChannel).updateMeeting!(
      startedMeeting,
      team,
      user
    )
    expect(res).toBe('success')
    expect(mockUpdateMessage).not.toHaveBeenCalled()
  })

  it('keeps the channel without logging an error when the start message was deleted', async () => {
    mockUpdateMessage.mockResolvedValue({ok: false, error: 'message_not_found'})
    const startedMeeting = await startMeetingIn([
      {channel: notificationChannel, ts: '1731340000.123450'}
    ])
    const res = await SlackSingleChannelNotifier(notificationChannel).updateMeeting!(
      startedMeeting,
      team,
      user
    )
    expect(res).toEqual({error: new Error('message_not_found')})
    expect(mockSet).not.toHaveBeenCalled()
    expect(logError).not.toHaveBeenCalled()
  })
})
