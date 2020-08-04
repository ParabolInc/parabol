import React from 'react'
import TemplateDetailAction from '../../../components/TemplateDetailAction'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddReflectTemplateMutation from '../../../mutations/AddReflectTemplateMutation'

interface Props {
  gotoTeamTemplates: () => void
  templateId: string
  teamId: string
}

const CloneTemplate = (props: Props) => {
  const {
    gotoTeamTemplates,
    templateId,
    teamId,
  } = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()

  const cloneTemplate = () => {
    if (submitting) return
    submitMutation()
    AddReflectTemplateMutation(atmosphere, {parentTemplateId: templateId, teamId}, {onError, onCompleted})
    gotoTeamTemplates()
  }
  return (
    <TemplateDetailAction icon={'content_copy'} tooltip={'Clone & Edit Template'} onClick={cloneTemplate} />
  )
}
export default CloneTemplate
