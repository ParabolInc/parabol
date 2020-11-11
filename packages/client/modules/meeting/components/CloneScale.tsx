import React from 'react'
import DetailAction from '../../../components/DetailAction'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import {Threshold} from '../../../types/constEnums'
import AddPokerTemplateScaleMutation from '../../../mutations/AddPokerTemplateScaleMutation'

interface Props {
  scaleId: string
  scaleCount: number
  teamId: string
}

const CloneScale = (props: Props) => {
  const {
    scaleId,
    scaleCount,
    teamId
  } = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const canClone = scaleCount < Threshold.MAX_RETRO_TEAM_TEMPLATES
  const tooltip = canClone ? 'Clone & Edit Scale' : 'Too many team templates! Remove one first'
  const cloneScale = () => {
    if (submitting || !canClone) return
    submitMutation()
    AddPokerTemplateScaleMutation(atmosphere, {parentScaleId: scaleId, teamId}, {onError, onCompleted})
  }
  return (
    <DetailAction disabled={!canClone} icon={'content_copy'} tooltip={tooltip} onClick={cloneScale} />
  )
}
export default CloneScale
