import {ResourceGrants} from '../../graphql/public/ResourceGrants'
import ensureMeetingMember from '../ensureMeetingMember'
import type {MCPContext} from '../MCPContext'
import runGraphQL from '../runGraphQL'

jest.mock('../runGraphQL', () => ({__esModule: true, default: jest.fn()}))

const resourceGrants: ResourceGrants = Object.create(ResourceGrants.prototype)

const context: MCPContext = {
  authorization: 'Bearer pat_test',
  ip: '127.0.0.1',
  grant: {userId: 'user-1', scopes: ['meetings:write'], aud: 'action-pat', resourceGrants}
}

test('joins the meeting as the caller each time and answers nothing when the server lets it', async () => {
  jest.mocked(runGraphQL).mockResolvedValue({data: {joinMeeting: {meetingId: 'meeting-1'}}})
  expect(await ensureMeetingMember(context, 'meeting-1')).toBeNull()
  expect(await ensureMeetingMember(context, 'meeting-1')).toBeNull()
  expect(runGraphQL).toHaveBeenCalledTimes(2)
  expect(runGraphQL).toHaveBeenCalledWith(
    context,
    expect.stringContaining('joinMeeting(meetingId: $meetingId)'),
    {meetingId: 'meeting-1'}
  )
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
