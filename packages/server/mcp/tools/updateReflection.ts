import {z} from 'zod'
import defineTool from '../defineTool'
import reflectionContentSchema from '../reflectionContentSchema'
import runGraphQL from '../runGraphQL'
import {withMarkdownContent} from '../tipTapContentToMarkdown'
import {writeAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const UPDATE_REFLECTION_CONTENT = `
  mutation UpdateReflectionContent($reflectionId: ID!, $content: String!) {
    updateReflectionContent(reflectionId: $reflectionId, content: $content) {
      reflection {
        id
        content
        plaintextContent
      }
    }
  }
`

export default defineTool({
  name: 'update_reflection',
  title: 'Edit a retrospective card',
  description:
    'Replace the text of a reflection card you wrote on a retrospective. The meeting must not be past the group phase. Needs meetings:write.',
  inputSchema: z.object({
    reflectionId: z.string().describe('The reflection id, from get_meeting or add_reflection'),
    content: reflectionContentSchema.describe('The new card text, in markdown')
  }),
  annotations: writeAnnotations,
  run: async (context, {reflectionId, content}) =>
    toolResult(
      withMarkdownContent(
        await runGraphQL(context, UPDATE_REFLECTION_CONTENT, {reflectionId, content})
      )
    )
})
