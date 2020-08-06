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

  const removeTemplate = () => {
    if (submitting) return
    submitMutation()
    const templateIds = teamTemplates.map(({id}) => id)
    const templateIdx = templateIds.indexOf(templateId)
    templateIds.splice(templateIdx, 1)
    // use the same index as the previous item. if the item was last in the list, grab the new last
    const nextTemplateId = templateIds[templateIdx] || templateIds[templateIds.length - 1]
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
