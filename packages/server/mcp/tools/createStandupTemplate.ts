import {Threshold} from 'parabol-client/types/constEnums'
import {z} from 'zod'
import createPromptTemplate, {templatePromptsSchema} from '../createPromptTemplate'
import defineTool from '../defineTool'
import {writeAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

export default defineTool({
  name: 'create_standup_template',
  title: 'Create a standup template',
  description: `Create a standup template on a team with the prompts you give, in order, up to ${Threshold.MAX_STANDUP_PROMPTS}. Then call select_template and start_standup to run a standup with it. It refuses a name another standup template on the team has. The Starter plan limits how many custom templates each person can make. An error with unfinishedTemplateId names a half-made template the tool could not remove, which already used a Starter free template: after any retryAfter, finish or remove it (removePromptTemplate) with graphql_mutate rather than retrying under a new name. Needs users:read, teams:read and templates:write.`,
  inputSchema: z.object({
    teamId: z.string().describe('The team that owns the template, from get_me'),
    name: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .describe("The template's name, which no other standup template on the team may have"),
    prompts: templatePromptsSchema(
      'prompt',
      'What did you get done yesterday?',
      Threshold.MAX_STANDUP_PROMPTS
    )
  }),
  annotations: writeAnnotations,
  run: async (context, {teamId, name, prompts}) => {
    const created = await createPromptTemplate(context, {teamId, type: 'teamPrompt', name, prompts})
    if ('error' in created) return created.error
    const {id, prompts: savedPrompts} = created.template
    return toolResult({data: {template: {id, name, prompts: savedPrompts}}})
  }
})
