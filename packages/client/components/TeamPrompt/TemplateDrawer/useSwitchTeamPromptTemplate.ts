import {useState} from 'react'
import type {PayloadError} from 'relay-runtime'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useUpdateMeetingTemplateMutation from '../../../mutations/useUpdateMeetingTemplateMutation'
import GraphQLServerError from '../../../utils/relay/GraphQLServerError'
import type {SwitchTemplateConfirmation} from './TeamPromptSwitchTemplateDialog'

interface PickedTemplate {
  id: string
  name: string
}

export type SwitchProblem =
  | {kind: 'failed'; template: PickedTemplate; clearTeamPromptResponses: boolean}
  | {kind: 'unavailable'; templateName: string}

interface Options {
  meetingId: string
  applyToSeries: boolean
  onSwitched: () => void
}

const useSwitchTeamPromptTemplate = (options: Options) => {
  const {meetingId, applyToSeries, onSwitched} = options
  const atmosphere = useAtmosphere()
  const [updateMeetingTemplate, submitting] = useUpdateMeetingTemplateMutation()
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<SwitchTemplateConfirmation | null>(null)
  const [problem, setProblem] = useState<SwitchProblem | null>(null)
  const [unavailableIds, setUnavailableIds] = useState<string[]>([])

  const handleError = (
    template: PickedTemplate,
    clearTeamPromptResponses: boolean,
    error: PayloadError | undefined
  ) => {
    const extensions: Record<string, unknown> | undefined = error?.extensions
    const code = extensions?.code
    const answeredCount = extensions?.answeredCount
    if (code === 'CONFLICT' && typeof answeredCount === 'number') {
      setConfirmation({templateId: template.id, templateName: template.name, answeredCount})
    } else if (code === 'NOT_FOUND') {
      setUnavailableIds((ids) => [...ids, template.id])
      setProblem({kind: 'unavailable', templateName: template.name})
    } else if (code === 'CONFLICT') {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'teamPromptTemplateConflict',
        message: error?.message ?? 'The template can no longer be changed',
        autoDismiss: 5
      })
      onSwitched()
    } else {
      setProblem({kind: 'failed', template, clearTeamPromptResponses})
    }
  }

  const submit = (template: PickedTemplate, clearTeamPromptResponses: boolean) => {
    setPendingTemplateId(template.id)
    setProblem(null)
    setConfirmation(null)
    updateMeetingTemplate({
      variables: {meetingId, templateId: template.id, applyToSeries, clearTeamPromptResponses},
      onCompleted: (_res, errors) => {
        setPendingTemplateId(null)
        if (errors?.[0]) {
          handleError(template, clearTeamPromptResponses, errors[0])
          return
        }
        onSwitched()
      },
      onError: (error) => {
        setPendingTemplateId(null)
        const serverError = error instanceof GraphQLServerError ? error.errors[0] : undefined
        handleError(template, clearTeamPromptResponses, serverError)
      }
    })
  }

  const retry = () => {
    if (problem?.kind === 'failed') submit(problem.template, problem.clearTeamPromptResponses)
  }

  return {
    submit,
    retry,
    submitting,
    pendingTemplateId,
    confirmation,
    cancelConfirmation: () => setConfirmation(null),
    askToConfirm: setConfirmation,
    problem,
    unavailableIds
  }
}

export default useSwitchTeamPromptTemplate
