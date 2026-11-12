import {useState} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useUpdateMeetingTemplateMutation from '../../../mutations/useUpdateMeetingTemplateMutation'
import getServerError, {type ServerError} from '../../../utils/relay/getServerError'
import type {SwitchTemplateConfirmation} from './TeamPromptSwitchTemplateDialog'

interface PickedTemplate {
  id: string
  name: string
}

export type SwitchProblem =
  | {kind: 'failed'; template: PickedTemplate; clearResponses: boolean}
  | {kind: 'unavailable'; templateName: string}

interface Options {
  meetingId: string
  applyToSeries: boolean
  onSwitched: () => void
}

const useSwitchStandupTemplate = (options: Options) => {
  const {meetingId, applyToSeries, onSwitched} = options
  const atmosphere = useAtmosphere()
  const [updateMeetingTemplate, submitting] = useUpdateMeetingTemplateMutation()
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<SwitchTemplateConfirmation | null>(null)
  const [problem, setProblem] = useState<SwitchProblem | null>(null)
  const [unavailableIds, setUnavailableIds] = useState<string[]>([])

  const handleError = (
    template: PickedTemplate,
    clearResponses: boolean,
    error: ServerError | undefined
  ) => {
    const code = error?.extensions?.code
    const answeredCount = error?.extensions?.answeredCount
    if (code === 'CONFLICT' && typeof answeredCount === 'number') {
      setConfirmation({templateId: template.id, templateName: template.name, answeredCount})
    } else if (code === 'NOT_FOUND') {
      setUnavailableIds((ids) => [...ids, template.id])
      setProblem({kind: 'unavailable', templateName: template.name})
    } else if (code === 'CONFLICT') {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'standupTemplateConflict',
        message: error?.message ?? 'The template can no longer be changed',
        autoDismiss: 5
      })
      onSwitched()
    } else {
      setProblem({kind: 'failed', template, clearResponses})
    }
  }

  const submit = (template: PickedTemplate, clearResponses: boolean) => {
    setPendingTemplateId(template.id)
    setProblem(null)
    setConfirmation(null)
    updateMeetingTemplate({
      variables: {meetingId, templateId: template.id, applyToSeries, clearResponses},
      onCompleted: (_res, errors) => {
        setPendingTemplateId(null)
        if (errors?.[0]) {
          handleError(template, clearResponses, errors[0])
          return
        }
        onSwitched()
      },
      onError: (error) => {
        setPendingTemplateId(null)
        handleError(template, clearResponses, getServerError(error))
      }
    })
  }

  const retry = () => {
    if (problem?.kind === 'failed') submit(problem.template, problem.clearResponses)
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

export default useSwitchStandupTemplate
