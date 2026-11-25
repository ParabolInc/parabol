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

const JOIN_MEETING_TO_ANSWER = `
  mutation JoinMeeting($meetingId: ID!) {
    joinMeeting(meetingId: $meetingId) {
      meetingMember {
        ... on TeamHealthMeetingMember {
          isSpectating
        }
      }
    }
  }
`

const OPT_IN_TO_TEAM_HEALTH = `
  mutation OptInToTeamHealth($meetingId: ID!) {
    setTeamHealthSpectate(meetingId: $meetingId, isSpectating: false) {
      meetingMember {
        isSpectating
      }
    }
  }
`

const ensureMeetingMember = async (
  context: MCPContext,
  meetingId: string,
  {optInToTeamHealth = true}: {optInToTeamHealth?: boolean} = {}
): Promise<CallToolResult | null> => {
  if (!optInToTeamHealth) {
    const joined = await runGraphQL(context, JOIN_MEETING, {meetingId})
    return joined.errors?.length ? toolResult(joined) : null
  }
  const joined = await runGraphQL<{joinMeeting: {meetingMember: {isSpectating?: boolean}}}>(
    context,
    JOIN_MEETING_TO_ANSWER,
    {meetingId}
  )
  if (joined.errors?.length) return toolResult(joined)
  if (!joined.data?.joinMeeting.meetingMember.isSpectating) return null
  const optedIn = await runGraphQL(context, OPT_IN_TO_TEAM_HEALTH, {meetingId})
  return optedIn.errors?.length ? toolResult(optedIn) : null
}

export default ensureMeetingMember
