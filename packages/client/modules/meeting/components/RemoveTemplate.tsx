import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import TemplateDetailAction from '../../../components/TemplateDetailAction'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import RemoveReflectTemplateMutation from '../../../mutations/RemoveReflectTemplateMutation'
import SelectRetroTemplateMutation from '../../../mutations/SelectRetroTemplateMutation'
import {RemoveTemplate_teamTemplates} from '../../../__generated__/RemoveTemplate_teamTemplates.graphql'


interface Props {
  gotoPublicTemplates: () => void
  teamTemplates: RemoveTemplate_teamTemplates
  templateId: string
  teamId: string
}

const RemoveTemplate = (props: Props) => {
  const {
    gotoPublicTemplates,
    templateId,
    teamId,
    teamTemplates,
  } = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const templateIdx = teamTemplates.findIndex((template) => template.id === templateId)
  const nextTemplateIdx = templateIdx <= 0 ? 0 : templateIdx - 1
  const nextTemplateId = teamTemplates[nextTemplateIdx]?.id ?? null

  const removeTemplate = () => {
    if (submitting) return
    submitMutation()
    if (nextTemplateId) {
      SelectRetroTemplateMutation(atmosphere, {selectedTemplateId: nextTemplateId, teamId})
    } else {
      gotoPublicTemplates()
    }
    RemoveReflectTemplateMutation(atmosphere, {templateId}, {onError, onCompleted})
  }

  return <TemplateDetailAction icon={'delete'} tooltip={'Delete template'} onClick={removeTemplate} />
}
export default createFragmentContainer(
  RemoveTemplate,
  {
    teamTemplates: graphql`
      fragment RemoveTemplate_teamTemplates on ReflectTemplate @relay(plural: true) {
        id
      }`
  }
)
