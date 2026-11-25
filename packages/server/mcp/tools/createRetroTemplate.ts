import type {FormattedExecutionResult} from 'graphql'
import {Threshold} from 'parabol-client/types/constEnums'
import {z} from 'zod'
import defineTool from '../defineTool'
import type {MCPContext} from '../MCPContext'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

interface Column {
  id: string
  question: string
  description: string
}

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
      meetingTemplate {
        id
      }
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
      prompt {
        id
      }
    }
  }
`

const UPDATE_TEMPLATE_PROMPT_DESCRIPTION = `
  mutation UpdateTemplatePromptDescription($promptId: ID!, $description: String!) {
    updateTemplatePromptDescription(promptId: $promptId, description: $description) {
      prompt {
        id
      }
    }
  }
`

const REMOVE_TEMPLATE_PROMPT = `
  mutation RemoveTemplatePrompt($promptId: ID!) {
    removeTemplatePrompt(promptId: $promptId) {
      prompt {
        id
      }
    }
  }
`

const REMOVE_PROMPT_TEMPLATE = `
  mutation RemovePromptTemplate($templateId: ID!) {
    removePromptTemplate(templateId: $templateId) {
      template {
        id
      }
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
  const {renameTemplatePrompt} = await runStep<{renameTemplatePrompt: {prompt: {id: string}}}>(
    context,
    RENAME_TEMPLATE_PROMPT,
    {promptId: column.id, question}
  )
  return {...column, id: renameTemplatePrompt.prompt.id, question}
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
    'Create a retrospective template on a team with the columns you give, in order. Then call select_template and start_retrospective to run a retro with it. The Starter plan limits how many custom templates each person can make. Needs templates:write.',
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
    const created = await runGraphQL<{
      addPromptTemplate: {template: {id: string; prompts: Column[]}}
    }>(context, ADD_PROMPT_TEMPLATE, {teamId})
    const template = created.data?.addPromptTemplate.template
    if (created.errors?.length || !template) return toolResult(created)
    const {id: templateId, prompts: startingColumns} = template
    try {
      await runStep(context, RENAME_MEETING_TEMPLATE, {templateId, name})
      for (const extraColumn of startingColumns.slice(columns.length)) {
        await runStep(context, REMOVE_TEMPLATE_PROMPT, {promptId: extraColumn.id})
      }
      const savedColumns: Column[] = []
      for (const [idx, {question, description}] of columns.entries()) {
        const column = startingColumns[idx] ?? (await addColumn(context, templateId))
        const renamed = await renameColumn(context, column, question)
        savedColumns.push(await describeColumn(context, renamed, description))
      }
      return toolResult({data: {template: {id: templateId, name, columns: savedColumns}}})
    } catch (error) {
      await runGraphQL(context, REMOVE_PROMPT_TEMPLATE, {templateId})
      if (error instanceof TemplateStepFailedError) return toolResult(error.result)
      throw error
    }
  }
})
