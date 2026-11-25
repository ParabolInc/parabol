import {z} from 'zod'
import type {MeetingTypeEnum} from '../../graphql/public/resolverTypes'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import {REMOVE_POKER_TEMPLATE_SCALE, REMOVE_PROMPT_TEMPLATE} from '../templateRemovalDocuments'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

const TEMPLATE_TYPE = `
  query TemplateType($templateId: ID!) {
    viewer {
      activity(activityId: $templateId) {
        type
      }
    }
  }
`

const REMOVE_POKER_TEMPLATE = `
  mutation RemovePokerTemplate($templateId: ID!) {
    deleted: removePokerTemplate(templateId: $templateId) {
      template: pokerTemplate {
        id
        name
      }
    }
  }
`

const REMOVE_TEMPLATE_DOCUMENTS: Partial<Record<MeetingTypeEnum, string>> = {
  retrospective: REMOVE_PROMPT_TEMPLATE,
  teamPrompt: REMOVE_PROMPT_TEMPLATE,
  poker: REMOVE_POKER_TEMPLATE
}

export default defineTool({
  name: 'delete_template',
  title: 'Delete a template or poker scale',
  description:
    "Delete a retrospective, standup or sprint poker template, or a poker scale. This can't be undone. Anyone on the team that owns a template or scale can delete it, and so can a billing leader for a template shared across their organization. It refuses anyone else's template or scale, Parabol's built-in templates and scales, team health templates (they can't be deleted), and a retro or standup template that a recurring meeting still uses: cancel that series with cancel_meeting_series first. If the template was the team's selected one, the team's next meeting of that kind uses another. Dimensions that used a deleted scale switch to Fibonacci. Deleting a scale needs only templates:write. Needs users:read, templates:read and templates:write.",
  inputSchema: z.object({
    templateId: z
      .string()
      .optional()
      .describe('The template to delete, from list_templates or the tool that made it'),
    scaleId: z
      .string()
      .optional()
      .describe('The poker scale to delete, from list_templates or create_poker_scale')
  }),
  annotations: writeAnnotations,
  run: async (context, {templateId, scaleId}) => {
    if (!templateId === !scaleId) {
      return toolError('Pass exactly one of templateId or scaleId.', 'BAD_USER_INPUT')
    }
    if (scaleId) {
      const removed = await runGraphQL(context, REMOVE_POKER_TEMPLATE_SCALE, {scaleId})
      if (removed.errors?.length) return toolResult(removed)
      return toolResult({data: {scale: {id: scaleId}}})
    }
    const found = await runGraphQL<{viewer: {activity: {type: MeetingTypeEnum} | null}}>(
      context,
      TEMPLATE_TYPE,
      {templateId}
    )
    if (found.errors?.length) return toolResult({errors: found.errors})
    const template = found.data?.viewer.activity
    if (!template) return toolError('Template not found', 'NOT_FOUND')
    const document = REMOVE_TEMPLATE_DOCUMENTS[template.type]
    if (!document) {
      return toolError(
        'Only retrospective, standup and sprint poker templates can be deleted.',
        'BAD_USER_INPUT'
      )
    }
    const removed = await runGraphQL<{deleted: {template: {id: string; name: string}}}>(
      context,
      document,
      {templateId}
    )
    const deleted = removed.data?.deleted
    if (removed.errors?.length || !deleted) return toolResult(removed)
    return toolResult({data: {template: deleted.template}})
  }
})
