import {z} from 'zod'
import defineTool from '../defineTool'
import markdownToReflectionContent, {
  ReflectionContentTooLongError
} from '../markdownToReflectionContent'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

const UPDATE_REFLECTION_CONTENT = `
  mutation UpdateReflectionContent($reflectionId: ID!, $content: String!) {
    updateReflectionContent(reflectionId: $reflectionId, content: $content) {
      reflection {
        id
        plaintextContent
      }
    }
  }
`

export default defineTool({
  name: 'update_reflection',
  title: 'Edit a retrospective card',
  description:
    'Replace the text of a reflection card you wrote on a retrospective, while its meeting is still running. Needs meetings:write.',
  inputSchema: z.object({
    reflectionId: z.string().describe('The reflection id, from get_meeting or add_reflection'),
    content: z.string().min(1).describe('The new card text, in markdown')
  }),
  annotations: writeAnnotations,
  run: async (context, {reflectionId, content}) => {
    try {
      return toolResult(
        await runGraphQL(context, UPDATE_REFLECTION_CONTENT, {
          reflectionId,
          content: markdownToReflectionContent(content)
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
