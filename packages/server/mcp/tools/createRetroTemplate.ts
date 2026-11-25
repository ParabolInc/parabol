import {Threshold} from 'parabol-client/types/constEnums'
import {z} from 'zod'
import createPromptTemplate, {templatePromptsSchema} from '../createPromptTemplate'
import defineTool from '../defineTool'
import {writeAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

export default defineTool({
  name: 'create_retro_template',
  title: 'Create a retrospective template',
  description:
    'Create a retrospective template on a team with the columns you give, in order. Then call select_template and start_retrospective to run a retro with it. The Starter plan limits how many custom templates each person can make. An error with unfinishedTemplateId names a half-made template the tool could not remove, which already used a Starter free template: after any retryAfter, finish it with graphql_mutate or remove it with delete_template rather than retrying under a new name. Needs users:read, teams:read and templates:write.',
  inputSchema: z.object({
    teamId: z.string().describe('The team that owns the template, from get_me'),
    name: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .describe("The template's name, which no other retro template on the team may have"),
    columns: templatePromptsSchema('column', 'What went well?', Threshold.MAX_REFLECTION_PROMPTS)
  }),
  annotations: writeAnnotations,
  run: async (context, {teamId, name, columns}) => {
    const created = await createPromptTemplate(context, {
      teamId,
      type: 'retrospective',
      name,
      prompts: columns
    })
    if ('error' in created) return created.error
    const {id, prompts} = created.template
    return toolResult({data: {template: {id, name, columns: prompts}}})
  }
})
