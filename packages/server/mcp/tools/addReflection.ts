import {z} from 'zod'
import defineTool from '../defineTool'
import reflectionContentSchema from '../reflectionContentSchema'
import runGraphQL from '../runGraphQL'
import {withMarkdownContent} from '../tipTapContentToMarkdown'
import {writeAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const CREATE_REFLECTION = `
  mutation CreateReflection($input: CreateReflectionInput!) {
    createReflection(input: $input) {
      reflection {
        id
        content
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
    'Add a reflection card to a column of a running retrospective, as you. Get the column ids (promptId) from list_retro_columns; a column from another meeting or template is refused. The meeting must not be past the group phase. Needs meetings:write.',
  inputSchema: z.object({
    meetingId: z
      .string()
      .describe('The retrospective id, from list_meetings or start_retrospective'),
    promptId: z
      .string()
      .describe('The column to add the card to: a column id from list_retro_columns'),
    content: reflectionContentSchema.describe('The card text, in markdown')
  }),
  annotations: writeAnnotations,
  run: async (context, {meetingId, promptId, content}) =>
    toolResult(
      withMarkdownContent(
        await runGraphQL(context, CREATE_REFLECTION, {
          input: {meetingId, promptId, content, sortOrder: Date.now()}
        })
      )
    )
})
