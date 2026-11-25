import {z} from 'zod'
import defineTool from '../defineTool'
import ensureMeetingMember from '../ensureMeetingMember'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const VOTE_FOR_POKER_STORY = `
  mutation VotePokerStory($meetingId: ID!, $stageId: ID!, $label: String) {
    voteForPokerStory(meetingId: $meetingId, stageId: $stageId, score: $label) {
      stage {
        id
      }
    }
  }
`

export default defineTool({
  name: 'vote_poker_story',
  title: 'Vote on a sprint poker story',
  description:
    "Vote on one sprint poker stage, a story's dimension, as yourself, joining the meeting first if you haven't. If you sit votes out, it first opts you in, as Let me vote! does in Parabol, so you vote in the team's later poker meetings too, and that stays even when it refuses the vote. A vote replaces your earlier vote on that stage, and null takes it back. The facilitator reveals the votes with reveal_poker_votes, and a vote cast after the reveal changes the revealed scores. It refuses a label that isn't on the dimension's scale, naming the labels it takes, a stage that isn't in the meeting, a meeting that isn't sprint poker or has ended, and one on a team you aren't on. Needs meetings:write.",
  inputSchema: z.object({
    meetingId: z
      .string()
      .describe('The sprint poker meeting id, from start_sprint_poker or list_meetings'),
    stageId: z
      .string()
      .describe('The stage to vote on, from add_poker_stories or get_poker_meeting'),
    label: z
      .string()
      .min(1)
      .nullable()
      .describe(
        "The card to vote, one of the scale's labels from add_poker_stories, such as 5 or ?, or null to take your vote back"
      )
  }),
  annotations: writeAnnotations,
  run: async (context, {meetingId, stageId, label}) => {
    const notJoined = await ensureMeetingMember(context, meetingId, {
      optInTo: label === null ? undefined : 'poker'
    })
    if (notJoined) return notJoined
    return toolResult(await runGraphQL(context, VOTE_FOR_POKER_STORY, {meetingId, stageId, label}))
  }
})
