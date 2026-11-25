import type {CallToolResult} from '@modelcontextprotocol/sdk/types.js'
import type {Mutation} from '../graphql/public/resolverTypes'
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

const SPECTATING_MEMBERS = {
  teamHealth: {memberType: 'TeamHealthMeetingMember', optIn: 'setTeamHealthSpectate'},
  poker: {memberType: 'PokerMeetingMember', optIn: 'setPokerSpectate'}
} as const satisfies Record<string, {memberType: string; optIn: keyof Mutation}>

const joinToTakePartDocument = (memberType: string) => `
  mutation JoinMeeting($meetingId: ID!) {
    joinMeeting(meetingId: $meetingId) {
      meetingMember {
        ... on ${memberType} {
          isSpectating
        }
      }
    }
  }
`

const optInDocument = (optIn: string) => `
  mutation OptIn($meetingId: ID!) {
    ${optIn}(meetingId: $meetingId, isSpectating: false) {
      meetingMember {
        isSpectating
      }
    }
  }
`

const ensureMeetingMember = async (
  context: MCPContext,
  meetingId: string,
  {optInTo}: {optInTo?: keyof typeof SPECTATING_MEMBERS} = {}
): Promise<CallToolResult | null> => {
  if (!optInTo) {
    const joined = await runGraphQL(context, JOIN_MEETING, {meetingId})
    return joined.errors?.length ? toolResult(joined) : null
  }
  const {memberType, optIn} = SPECTATING_MEMBERS[optInTo]
  const joined = await runGraphQL<{joinMeeting: {meetingMember: {isSpectating?: boolean}}}>(
    context,
    joinToTakePartDocument(memberType),
    {meetingId}
  )
  if (joined.errors?.length) return toolResult(joined)
  if (!joined.data?.joinMeeting.meetingMember.isSpectating) return null
  const optedIn = await runGraphQL(context, optInDocument(optIn), {meetingId})
  return optedIn.errors?.length ? toolResult(optedIn) : null
}

export default ensureMeetingMember
