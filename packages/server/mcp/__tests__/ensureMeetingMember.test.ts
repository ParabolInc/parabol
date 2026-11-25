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
  expect(await ensureMeetingMember(context, 'meeting-1')).toBeNull()
  expect(runGraphQL).toHaveBeenLastCalledWith(
    context,
    expect.stringContaining('setTeamHealthSpectate(meetingId: $meetingId, isSpectating: false)'),
    {meetingId: 'meeting-1'}
  )
  expect(await ensureMeetingMember(context, 'meeting-1')).toBeNull()
  expect(runGraphQL).toHaveBeenCalledTimes(3)
})

test('only joins, never opting a team health member in, when told not to opt in', async () => {
  jest.mocked(runGraphQL).mockResolvedValue({data: {joinMeeting: {meetingId: 'meeting-1'}}})
  expect(await ensureMeetingMember(context, 'meeting-1', {optInToTeamHealth: false})).toBeNull()
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
  expect(await ensureMeetingMember(context, 'meeting-1', {optInToTeamHealth: false})).toEqual({
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
  expect(await ensureMeetingMember(context, 'meeting-1')).toEqual({
    isError: true,
    content: [
      {type: 'text', text: JSON.stringify([{message: 'Meeting has ended', code: 'CONFLICT'}])}
    ]
  })
})

test("answers with the server's coded error when the caller cannot join", async () => {
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
