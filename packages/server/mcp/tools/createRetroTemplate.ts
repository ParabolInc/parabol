import type {FormattedExecutionResult} from 'graphql'
import {Threshold} from 'parabol-client/types/constEnums'
import {z} from 'zod'
import defineTool from '../defineTool'
import type {MCPContext} from '../MCPContext'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

interface Column {
  id: string
  question: string
  description: string
}

const RETRO_TEMPLATE_NAMES = `
  query RetroTemplateNames($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        meetingSettings(meetingType: retrospective) {
          ... on RetrospectiveMeetingSettings {
            reflectTemplates {
              name
            }
          }
        }
      }
    }
  }
`

const ADD_PROMPT_TEMPLATE = `
  mutation AddPromptTemplate($teamId: ID!) {
    addPromptTemplate(teamId: $teamId, type: retrospective) {
      template {
        id
        prompts {
          id
          question
          description
        }
      }
    }
  }
`

const RENAME_MEETING_TEMPLATE = `
  mutation RenameMeetingTemplate($templateId: ID!, $name: String!) {
    renameMeetingTemplate(templateId: $templateId, name: $name) {
      __typename
    }
  }
`

const ADD_TEMPLATE_PROMPT = `
  mutation AddTemplatePrompt($templateId: ID!) {
    addTemplatePrompt(templateId: $templateId) {
      prompt {
        id
        question
        description
      }
    }
  }
`

const RENAME_TEMPLATE_PROMPT = `
  mutation RenameTemplatePrompt($promptId: ID!, $question: String!) {
    renameTemplatePrompt(promptId: $promptId, question: $question) {
      __typename
    }
  }
`

const UPDATE_TEMPLATE_PROMPT_DESCRIPTION = `
  mutation UpdateTemplatePromptDescription($promptId: ID!, $description: String!) {
    updateTemplatePromptDescription(promptId: $promptId, description: $description) {
      __typename
    }
  }
`

const REMOVE_PROMPT_TEMPLATE = `
  mutation RemovePromptTemplate($templateId: ID!) {
    removePromptTemplate(templateId: $templateId) {
      __typename
    }
  }
`

class TemplateStepFailedError extends Error {
  result: FormattedExecutionResult

  constructor(result: FormattedExecutionResult) {
    super('A step of create_retro_template failed')
    this.result = result
  }
}

const runStep = async <TData extends Record<string, unknown>>(
  context: MCPContext,
  document: string,
  variables: Record<string, unknown>
) => {
  const result = await runGraphQL<TData>(context, document, variables)
  if (result.errors?.length || !result.data) throw new TemplateStepFailedError(result)
  return result.data
}

const addColumn = async (context: MCPContext, templateId: string) => {
  const {addTemplatePrompt} = await runStep<{addTemplatePrompt: {prompt: Column}}>(
    context,
    ADD_TEMPLATE_PROMPT,
    {templateId}
  )
  return addTemplatePrompt.prompt
}

const renameColumn = async (context: MCPContext, column: Column, question: string) => {
  if (column.question === question) return column
  await runStep(context, RENAME_TEMPLATE_PROMPT, {promptId: column.id, question})
  return {...column, question}
}

const describeColumn = async (context: MCPContext, column: Column, description: string) => {
  if (column.description === description) return column
  await runStep(context, UPDATE_TEMPLATE_PROMPT_DESCRIPTION, {promptId: column.id, description})
  return {...column, description}
}

const columnSchema = z.object({
  question: z.string().trim().min(1).max(100).describe('The column title, such as What went well?'),
  description: z
    .string()
    .trim()
    .max(256)
    .default('')
    .describe('A longer prompt shown under the title. Omit for none')
})

export default defineTool({
  name: 'create_retro_template',
  title: 'Create a retrospective template',
  description:
    'Create a retrospective template on a team with the columns you give, in order. Then call select_template and start_retrospective to run a retro with it. The Starter plan limits how many custom templates each person can make. An error with unfinishedTemplateId names a half-made template the tool could not remove, which already used a Starter free template: after any retryAfter, finish or remove it (removePromptTemplate) with graphql_mutate rather than retrying under a new name. Needs users:read, teams:read and templates:write.',
  inputSchema: z.object({
    teamId: z.string().describe('The team that owns the template, from get_me'),
    name: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .describe("The template's name, which no other retro template on the team may have"),
    columns: z
      .array(columnSchema)
      .min(1)
      .max(Threshold.MAX_REFLECTION_PROMPTS)
      .refine(
        (columns) => new Set(columns.map(({question}) => question)).size === columns.length,
        'Each column needs its own question'
      )
      .describe('The columns, in order')
  }),
  annotations: writeAnnotations,
  run: async (context, {teamId, name, columns}) => {
    const existing = await runGraphQL<{
      viewer: {team: {meetingSettings: {reflectTemplates: {name: string}[]}} | null}
    }>(context, RETRO_TEMPLATE_NAMES, {teamId})
    if (existing.errors?.length) return toolResult(existing)
    const templates = existing.data?.viewer.team?.meetingSettings.reflectTemplates ?? []
    if (templates.some((template) => template.name === name)) {
      return toolError(
        `The team already has a retro template named "${name}". Pick another name.`,
        'CONFLICT'
      )
    }
    const created = await runGraphQL<{
      addPromptTemplate: {template: {id: string; prompts: Column[]}}
    }>(context, ADD_PROMPT_TEMPLATE, {teamId})
    const template = created.data?.addPromptTemplate.template
    if (created.errors?.length || !template) return toolResult(created)
    const {id: templateId, prompts: startingColumns} = template
    try {
      await runStep(context, RENAME_MEETING_TEMPLATE, {templateId, name})
      const savedColumns: Column[] = []
      for (const [idx, {question, description}] of columns.entries()) {
        const column = startingColumns[idx] ?? (await addColumn(context, templateId))
        const renamed = await renameColumn(context, column, question)
        savedColumns.push(await describeColumn(context, renamed, description))
      }
      return toolResult({data: {template: {id: templateId, name, columns: savedColumns}}})
    } catch (error) {
      const removed = await runGraphQL(context, REMOVE_PROMPT_TEMPLATE, {templateId})
      if (!(error instanceof TemplateStepFailedError)) throw error
      return toolResult(
        error.result,
        removed.errors?.length ? {unfinishedTemplateId: templateId} : undefined
      )
    }
  }
})
