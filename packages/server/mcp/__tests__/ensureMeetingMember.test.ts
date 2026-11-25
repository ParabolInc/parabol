import {ResourceGrants} from '../../graphql/public/ResourceGrants'
import ensureMeetingMember from '../ensureMeetingMember'
import type {MCPContext} from '../MCPContext'
import runGraphQL from '../runGraphQL'

jest.mock('../runGraphQL', () => ({__esModule: true, default: jest.fn()}))

afterEach(() => {
  jest.mocked(runGraphQL).mockReset()
})

const resourceGrants: ResourceGrants = Object.create(ResourceGrants.prototype)

const context: MCPContext = {
  authorization: 'Bearer pat_test',
  ip: '127.0.0.1',
  grant: {userId: 'user-1', scopes: ['meetings:write'], aud: 'action-pat', resourceGrants}
}

test('joins the meeting as the caller each time and answers nothing when the server lets it', async () => {
  jest.mocked(runGraphQL).mockResolvedValue({data: {joinMeeting: {meetingMember: {}}}})
  expect(await ensureMeetingMember(context, 'meeting-1')).toBeNull()
  expect(await ensureMeetingMember(context, 'meeting-1')).toBeNull()
  expect(runGraphQL).toHaveBeenCalledTimes(2)
  expect(runGraphQL).toHaveBeenCalledWith(
    context,
    expect.stringContaining('joinMeeting(meetingId: $meetingId)'),
    {meetingId: 'meeting-1'}
  )
})

test('opts a team health member who is sitting the check out in, and leaves one who answers as they are', async () => {
  jest
    .mocked(runGraphQL)
    .mockResolvedValueOnce({data: {joinMeeting: {meetingMember: {isSpectating: true}}}})
    .mockResolvedValueOnce({data: {setTeamHealthSpectate: {meetingMember: {isSpectating: false}}}})
    .mockResolvedValueOnce({data: {joinMeeting: {meetingMember: {isSpectating: false}}}})
  expect(await ensureMeetingMember(context, 'meeting-1', {optInTo: 'teamHealth'})).toBeNull()
  expect(runGraphQL).toHaveBeenLastCalledWith(
    context,
    expect.stringContaining('setTeamHealthSpectate(meetingId: $meetingId, isSpectating: false)'),
    {meetingId: 'meeting-1'}
  )
  expect(await ensureMeetingMember(context, 'meeting-1', {optInTo: 'teamHealth'})).toBeNull()
  expect(runGraphQL).toHaveBeenCalledTimes(3)
})

test('opts a poker member who sits votes out in, asking only about poker spectating', async () => {
  jest
    .mocked(runGraphQL)
    .mockResolvedValueOnce({data: {joinMeeting: {meetingMember: {isSpectating: true}}}})
    .mockResolvedValueOnce({data: {setPokerSpectate: {meetingMember: {isSpectating: false}}}})
  expect(await ensureMeetingMember(context, 'meeting-1', {optInTo: 'poker'})).toBeNull()
  const [joinDocument, optInDocument] = jest
    .mocked(runGraphQL)
    .mock.calls.map(([, document]) => document)
  expect(joinDocument).toContain('... on PokerMeetingMember')
  expect(joinDocument).not.toContain('TeamHealthMeetingMember')
  expect(optInDocument).toContain('setPokerSpectate(meetingId: $meetingId, isSpectating: false)')
  expect(runGraphQL).toHaveBeenCalledTimes(2)
})

test('answering a team health check asks only about team health spectating', async () => {
  jest.mocked(runGraphQL).mockResolvedValue({data: {joinMeeting: {meetingMember: {}}}})
  expect(await ensureMeetingMember(context, 'meeting-1', {optInTo: 'teamHealth'})).toBeNull()
  const [joinDocument] = jest.mocked(runGraphQL).mock.calls.map(([, document]) => document)
  expect(joinDocument).toContain('... on TeamHealthMeetingMember')
  expect(joinDocument).not.toContain('PokerMeetingMember')
  expect(runGraphQL).toHaveBeenCalledTimes(1)
})

test('only joins, never opting a team health member in, unless asked to', async () => {
  jest.mocked(runGraphQL).mockResolvedValue({data: {joinMeeting: {meetingId: 'meeting-1'}}})
  expect(await ensureMeetingMember(context, 'meeting-1')).toBeNull()
  expect(runGraphQL).toHaveBeenCalledTimes(1)
  expect(runGraphQL).toHaveBeenCalledWith(
    context,
    expect.stringContaining('joinMeeting(meetingId: $meetingId)'),
    {meetingId: 'meeting-1'}
  )
  expect(jest.mocked(runGraphQL).mock.calls[0]![1]).not.toContain('isSpectating')
})

test("answers with the server's coded error when it only joins and the caller cannot", async () => {
  jest.mocked(runGraphQL).mockResolvedValue({
    data: null,
    errors: [{message: 'Meeting has already ended', extensions: {code: 'CONFLICT'}}]
  })
  expect(await ensureMeetingMember(context, 'meeting-1')).toEqual({
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify([{message: 'Meeting has already ended', code: 'CONFLICT'}])
      }
    ]
  })
})

test("answers with the server's coded error when the opt-in is refused", async () => {
  jest
    .mocked(runGraphQL)
    .mockResolvedValueOnce({data: {joinMeeting: {meetingMember: {isSpectating: true}}}})
    .mockResolvedValueOnce({
      data: null,
      errors: [{message: 'Meeting has ended', extensions: {code: 'CONFLICT'}}]
    })
  expect(await ensureMeetingMember(context, 'meeting-1', {optInTo: 'teamHealth'})).toEqual({
    isError: true,
    content: [
      {type: 'text', text: JSON.stringify([{message: 'Meeting has ended', code: 'CONFLICT'}])}
    ]
  })
})

test("answers with the server's coded error when the caller cannot join to vote, and opts nothing in", async () => {
  jest.mocked(runGraphQL).mockResolvedValue({
    data: null,
    errors: [{message: 'Meeting has already ended', extensions: {code: 'CONFLICT'}}]
  })
  expect(await ensureMeetingMember(context, 'meeting-1', {optInTo: 'poker'})).toEqual({
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify([{message: 'Meeting has already ended', code: 'CONFLICT'}])
      }
    ]
  })
  expect(runGraphQL).toHaveBeenCalledTimes(1)
})
