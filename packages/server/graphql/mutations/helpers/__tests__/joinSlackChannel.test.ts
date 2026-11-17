import joinSlackChannel from '../joinSlackChannel'

const makeManager = (opts: {
  info?:
    | {ok: true; channel: {id: string; is_member: boolean; is_archived: boolean}}
    | {ok: false; error: string}
  join?: {ok: true; channel: {id: string}} | {ok: false; error: string}
}) => {
  const getConversationInfo = jest.fn().mockResolvedValue(opts.info)
  const joinConversation = jest.fn().mockResolvedValue(opts.join)
  return {getConversationInfo, joinConversation}
}

const channel = (overrides: Partial<{is_member: boolean; is_archived: boolean}> = {}) => ({
  ok: true as const,
  channel: {id: 'C123', is_member: false, is_archived: false, ...overrides}
})

describe('joinSlackChannel', () => {
  it('uses a channel the bot is already a member of without calling join', async () => {
    const manager = makeManager({info: channel({is_member: true})})
    const res = await joinSlackChannel(manager, 'C123')
    expect(res).toEqual({ok: true, channelId: 'C123'})
    expect(manager.joinConversation).not.toHaveBeenCalled()
  })

  it('joins a public channel the bot is not yet a member of', async () => {
    const manager = makeManager({info: channel(), join: {ok: true, channel: {id: 'C123'}}})
    const res = await joinSlackChannel(manager, 'C123')
    expect(res).toEqual({ok: true, channelId: 'C123'})
    expect(manager.joinConversation).toHaveBeenCalledWith('C123')
  })

  it('fails when the bot cannot see the channel (private channel it was not invited to)', async () => {
    const manager = makeManager({info: {ok: false, error: 'channel_not_found'}})
    const res = await joinSlackChannel(manager, 'G999')
    expect(res).toEqual({ok: false, error: 'channel_not_found'})
    expect(manager.joinConversation).not.toHaveBeenCalled()
  })

  it('fails on an archived channel', async () => {
    const manager = makeManager({info: channel({is_member: true, is_archived: true})})
    const res = await joinSlackChannel(manager, 'C123')
    expect(res).toEqual({ok: false, error: 'Slack channel archived'})
  })

  it('fails when join is rejected', async () => {
    const manager = makeManager({
      info: channel(),
      join: {ok: false, error: 'method_not_supported_for_channel_type'}
    })
    const res = await joinSlackChannel(manager, 'C123')
    expect(res).toEqual({ok: false, error: 'Unable to join slack channel'})
  })
})
