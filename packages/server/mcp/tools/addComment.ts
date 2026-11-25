import {z} from 'zod'
import defineTool from '../defineTool'
import ensureMeetingMember from '../ensureMeetingMember'
import isScopeGranted from '../isScopeGranted'
import markdownToTaskContent from '../markdownToTaskContent'
import runGraphQL from '../runGraphQL'
import {withMarkdownContent} from '../tipTapContentToMarkdown'
import {writeAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const ADD_COMMENT = `
  mutation AddComment($comment: AddCommentInput!, $canReadComments: Boolean!) {
    addComment(comment: $comment) {
      comment {
        id
        ... @include(if: $canReadComments) {
          content
          plaintextContent
        }
      }
    }
  }
`

export default defineTool({
  name: 'add_comment',
  title: 'Comment in a discussion',
  description:
    "Comment as yourself in a meeting discussion, after its last comment or as a reply to one, joining the meeting first if you haven't. Get the discussionId from list_discussions for a retrospective or check-in, or from get_standup, get_poker_meeting or get_team_health_meeting. Comments are markdown. The comment editor can't show tables, checklists or images, so a table or checklist becomes plain paragraphs and an image becomes a link. It returns the new comment id, and its text as markdown too when the connection has comments:read. It refuses a meeting that ended before you joined it, one on a team you aren't on, and a discussion in a meeting you aren't in. Needs meetings:write and comments:write.",
  inputSchema: z.object({
    meetingId: z.string().describe('The meeting the discussion is in'),
    discussionId: z.string().describe('The discussion to comment in'),
    content: z.string().min(1).describe('What the comment says, in markdown'),
    threadParentId: z
      .string()
      .optional()
      .describe(
        'The comment to reply to, from get_discussion. Omit to add to the end of the thread'
      )
  }),
  annotations: writeAnnotations,
  run: async (context, {meetingId, discussionId, content, threadParentId}) => {
    const notJoined = await ensureMeetingMember(context, meetingId)
    if (notJoined) return notJoined
    return toolResult(
      withMarkdownContent(
        await runGraphQL(context, ADD_COMMENT, {
          comment: {
            discussionId,
            threadParentId,
            content: markdownToTaskContent(content, 'comment')
          },
          canReadComments: isScopeGranted(context, 'comments:read')
        })
      )
    )
  }
})
