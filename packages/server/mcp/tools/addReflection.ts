import {z} from 'zod'
import defineTool from '../defineTool'
import markdownToReflectionContent, {
  ReflectionContentTooLongError
} from '../markdownToReflectionContent'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

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

export default defineTool({
  name: 'add_reflection',
  title: 'Add a retrospective card',
  description:
    'Add a reflection card to a column of a running retrospective, as you. Get the column ids (promptId) from list_retro_columns. The meeting must not be past the group phase. Needs meetings:write.',
  inputSchema: z.object({
    meetingId: z.string().describe('The retrospective id, from start_retrospective or get_meeting'),
    promptId: z
      .string()
      .describe('The column to add the card to: a column id from list_retro_columns'),
    content: z.string().min(1).describe('The card text, in markdown')
  }),
  annotations: writeAnnotations,
  run: async (context, {meetingId, promptId, content}) => {
    try {
      return toolResult(
        await runGraphQL(context, CREATE_REFLECTION, {
          input: {
            meetingId,
            promptId,
            content: markdownToReflectionContent(content),
            sortOrder: Date.now()
          }
        })
      )
    } catch (error) {
      if (error instanceof ReflectionContentTooLongError) {
        return toolError(error.message, 'BAD_USER_INPUT')
      }
      throw error
    }
  }
})
