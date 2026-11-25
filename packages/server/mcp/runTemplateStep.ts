import type {FormattedExecutionResult} from 'graphql'
import type {MCPContext} from './MCPContext'
import runGraphQL from './runGraphQL'

const RENAME_MEETING_TEMPLATE = `
  mutation RenameMeetingTemplate($templateId: ID!, $name: String!) {
    renameMeetingTemplate(templateId: $templateId, name: $name) {
      __typename
    }
  }
`

export class TemplateStepFailedError extends Error {
  result: FormattedExecutionResult

  constructor(result: FormattedExecutionResult) {
    super('A step of making a template failed')
    this.result = result
  }
}

const runTemplateStep = async <TData extends Record<string, unknown>>(
  context: MCPContext,
  document: string,
  variables: Record<string, unknown>
) => {
  const result = await runGraphQL<TData>(context, document, variables)
  if (result.errors?.length || !result.data) throw new TemplateStepFailedError(result)
  return result.data
}

export const renameMeetingTemplate = (context: MCPContext, templateId: string, name: string) =>
  runTemplateStep(context, RENAME_MEETING_TEMPLATE, {templateId, name})

export default runTemplateStep
