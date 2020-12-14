import React from 'react'
import AddPokerTemplateMutation from '../../../mutations/AddPokerTemplateMutation'
import {MeetingTypeEnum} from '../../../types/graphql'
import DetailAction from '../../../components/DetailAction'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddReflectTemplateMutation from '../../../mutations/AddReflectTemplateMutation'
import {Threshold} from '../../../types/constEnums'

interface Props {
  gotoTeamTemplates: () => void
  templateId: string
  templateCount: number
  teamId: string
  type: string
}

const CloneTemplate = (props: Props) => {
  const {
    templateCount,
    gotoTeamTemplates,
    templateId,
    teamId,
    type
  } = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const canClone = templateCount < Threshold.MAX_RETRO_TEAM_TEMPLATES
  const tooltip = canClone ? 'Clone & Edit Template' : 'Too many team templates! Remove one first'
  const cloneTemplate = () => {
    if (submitting || !canClone) return
    submitMutation()
    if (type === MeetingTypeEnum.retrospective) {
      AddReflectTemplateMutation(atmosphere, {parentTemplateId: templateId, teamId}, {onError, onCompleted})
    } else if (type === MeetingTypeEnum.poker) {
      AddPokerTemplateMutation(atmosphere, {parentTemplateId: templateId, teamId}, {onError, onCompleted})
    }
    gotoTeamTemplates()
  }
  return (
    <DetailAction disabled={!canClone} icon={'content_copy'} tooltip={tooltip} onClick={cloneTemplate} />
  )
}
export default CloneTemplate
