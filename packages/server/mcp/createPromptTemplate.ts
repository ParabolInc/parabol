import type {CallToolResult} from '@modelcontextprotocol/sdk/types.js'
import {z} from 'zod'
import type {PromptTemplateTypeEnum} from '../graphql/public/resolverTypes'
import type {MCPContext} from './MCPContext'
import runGraphQL from './runGraphQL'
import runTemplateStep, {renameMeetingTemplate, TemplateStepFailedError} from './runTemplateStep'
import {REMOVE_PROMPT_TEMPLATE} from './templateRemovalDocuments'
import toolError from './toolError'
import toolResult from './toolResult'

interface TemplatePrompt {
  id: string
  question: string
  description: string
}

const TEMPLATE_KINDS = {
  retrospective: {
    label: 'retro',
    settingsType: 'RetrospectiveMeetingSettings',
    field: 'reflectTemplates'
  },
  teamPrompt: {label: 'standup', settingsType: 'TeamPromptMeetingSettings', field: 'teamTemplates'}
} satisfies Record<PromptTemplateTypeEnum, {label: string; settingsType: string; field: string}>

const templateNamesDocument = (type: PromptTemplateTypeEnum) => `
  query PromptTemplateNames($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        meetingSettings(meetingType: ${type}) {
          ... on ${TEMPLATE_KINDS[type].settingsType} {
            templates: ${TEMPLATE_KINDS[type].field} {
              name
            }
          }
        }
      }
    }
  }
`

const ADD_PROMPT_TEMPLATE = `
  mutation AddPromptTemplate($teamId: ID!, $type: PromptTemplateTypeEnum!) {
    addPromptTemplate(teamId: $teamId, type: $type) {
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

const addPrompt = async (context: MCPContext, templateId: string) => {
  const {addTemplatePrompt} = await runTemplateStep<{addTemplatePrompt: {prompt: TemplatePrompt}}>(
    context,
    ADD_TEMPLATE_PROMPT,
    {templateId}
  )
  return addTemplatePrompt.prompt
}

const renamePrompt = async (context: MCPContext, prompt: TemplatePrompt, question: string) => {
  if (prompt.question === question) return prompt
  await runTemplateStep(context, RENAME_TEMPLATE_PROMPT, {promptId: prompt.id, question})
  return {...prompt, question}
}

const describePrompt = async (context: MCPContext, prompt: TemplatePrompt, description: string) => {
  if (prompt.description === description) return prompt
  await runTemplateStep(context, UPDATE_TEMPLATE_PROMPT_DESCRIPTION, {
    promptId: prompt.id,
    description
  })
  return {...prompt, description}
}

export const templatePromptsSchema = (noun: string, questionExample: string, maxPrompts: number) =>
  z
    .array(
      z.object({
        question: z
          .string()
          .trim()
          .min(1)
          .max(100)
          .describe(`The ${noun} title, such as ${questionExample}`),
        description: z
          .string()
          .trim()
          .max(256)
          .default('')
          .describe('A longer prompt shown under the title. Omit for none')
      })
    )
    .min(1)
    .max(maxPrompts)
    .refine(
      (prompts) => new Set(prompts.map(({question}) => question)).size === prompts.length,
      `Each ${noun} needs its own question`
    )
    .describe(`The ${noun}s, in order`)

interface PromptTemplateInput {
  teamId: string
  type: PromptTemplateTypeEnum
  name: string
  prompts: Omit<TemplatePrompt, 'id'>[]
}

type CreatePromptTemplateResult =
  | {template: {id: string; prompts: TemplatePrompt[]}}
  | {error: CallToolResult}

const createPromptTemplate = async (
  context: MCPContext,
  {teamId, type, name, prompts}: PromptTemplateInput
): Promise<CreatePromptTemplateResult> => {
  const existing = await runGraphQL<{
    viewer: {team: {meetingSettings: {templates: {name: string}[]}} | null}
  }>(context, templateNamesDocument(type), {teamId})
  if (existing.errors?.length) return {error: toolResult(existing)}
  const templates = existing.data?.viewer.team?.meetingSettings.templates ?? []
  if (templates.some((template) => template.name === name)) {
    return {
      error: toolError(
        `The team already has a ${TEMPLATE_KINDS[type].label} template named "${name}". Pick another name.`,
        'CONFLICT'
      )
    }
  }
  const created = await runGraphQL<{
    addPromptTemplate: {template: {id: string; prompts: TemplatePrompt[]}}
  }>(context, ADD_PROMPT_TEMPLATE, {teamId, type})
  const template = created.data?.addPromptTemplate.template
  if (created.errors?.length || !template) return {error: toolResult(created)}
  const {id: templateId, prompts: startingPrompts} = template
  try {
    await renameMeetingTemplate(context, templateId, name)
    const savedPrompts: TemplatePrompt[] = []
    for (const [idx, {question, description}] of prompts.entries()) {
      const prompt = startingPrompts[idx] ?? (await addPrompt(context, templateId))
      const renamed = await renamePrompt(context, prompt, question)
      savedPrompts.push(await describePrompt(context, renamed, description))
    }
    return {template: {id: templateId, prompts: savedPrompts}}
  } catch (error) {
    const removed = await runGraphQL(context, REMOVE_PROMPT_TEMPLATE, {templateId})
    if (!(error instanceof TemplateStepFailedError)) throw error
    return {
      error: toolResult(
        error.result,
        removed.errors?.length ? {unfinishedTemplateId: templateId} : undefined
      )
    }
  }
}

export default createPromptTemplate
