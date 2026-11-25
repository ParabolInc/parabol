import type {CallToolResult} from '@modelcontextprotocol/sdk/types.js'
import type {MCPContext} from './MCPContext'
import runGraphQL from './runGraphQL'
import toolResult from './toolResult'

const JOIN_MEETING = `
  mutation JoinMeeting($meetingId: ID!) {
    joinMeeting(meetingId: $meetingId) {
      meetingId
    }
  }
`

const ensureMeetingMember = async (
  context: MCPContext,
  meetingId: string
): Promise<CallToolResult | null> => {
  const joined = await runGraphQL(context, JOIN_MEETING, {meetingId})
  return joined.errors?.length ? toolResult(joined) : null
}

export default ensureMeetingMember
