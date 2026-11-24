import {z} from 'zod'
import defineTool from '../defineTool'
import markdownToReflectionContent, {
  ReflectionContentTooLongError
} from '../markdownToReflectionContent'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

const GET_COLUMN_SORT_ORDERS = `
  query GetColumnSortOrders($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        ... on RetrospectiveMeeting {
          reflectionGroups {
            sortOrder
            prompt {
              id
            }
          }
        }
      }
    }
  }
`

const CREATE_REFLECTION = `
  mutation CreateReflection($input: CreateReflectionInput!) {
    createReflection(input: $input) {
      reflection {
        id
        plaintextContent
        promptId
      }
    }
  }
`

type ColumnSortOrders = {
  viewer: {
    meeting: {reflectionGroups?: {sortOrder: number; prompt: {id: string}}[]} | null
  }
}

export default defineTool({
  name: 'add_reflection',
  title: 'Add a retrospective card',
  description:
    'Add a reflection card to a column of a running retrospective, as you. Get the column ids (promptId) from get_meeting. The meeting must not be past the group phase. Needs users:read, meetings:read and meetings:write.',
  inputSchema: z.object({
    meetingId: z.string().describe('The retrospective id, from start_retrospective or get_meeting'),
    promptId: z.string().describe('The column to add the card to: a column id from get_meeting'),
    content: z.string().min(1).describe('The card text, in markdown')
  }),
  annotations: writeAnnotations,
  run: async (context, {meetingId, promptId, content}) => {
    let reflectionContent: string
    try {
      reflectionContent = markdownToReflectionContent(content)
    } catch (error) {
      if (error instanceof ReflectionContentTooLongError) {
        return toolError(error.message, 'BAD_USER_INPUT')
      }
      throw error
    }
    const lookup = await runGraphQL<ColumnSortOrders>(context, GET_COLUMN_SORT_ORDERS, {meetingId})
    const groups = lookup.data?.viewer.meeting?.reflectionGroups
    if (!groups) return toolResult(lookup)
    const columnSortOrders = groups
      .filter(({prompt}) => prompt.id === promptId)
      .map(({sortOrder}) => sortOrder)
    const sortOrder = columnSortOrders.length ? Math.max(...columnSortOrders) + 1 : 0
    return toolResult(
      await runGraphQL(context, CREATE_REFLECTION, {
        input: {meetingId, promptId, content: reflectionContent, sortOrder}
      })
    )
  }
})
