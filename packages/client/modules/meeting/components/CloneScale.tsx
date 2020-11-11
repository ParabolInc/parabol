import React from 'react'
import DetailAction from '../../../components/DetailAction'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import {Threshold} from '../../../types/constEnums'
import AddPokerTemplateScaleMutation from '../../../mutations/AddPokerTemplateScaleMutation'
import {MenuProps} from '../../../hooks/useMenu'

interface Props {
  scaleId: string
  scaleCount: number
  teamId: string
  menuProps: MenuProps
}

const CloneScale = (props: Props) => {
  const {
    scaleId,
    scaleCount,
    teamId,
    menuProps
  } = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const {closePortal} = menuProps
  const canClone = scaleCount < Threshold.MAX_RETRO_TEAM_TEMPLATES
  const tooltip = canClone ? 'Clone & Edit Scale' : 'Too many team templates! Remove one first'
  const cloneScale = () => {
    if (submitting || !canClone) return
    submitMutation()
    AddPokerTemplateScaleMutation(atmosphere, {parentScaleId: scaleId, teamId}, {onError, onCompleted})
    closePortal()
  }
  return (
    <DetailAction disabled={!canClone} icon={'content_copy'} tooltip={tooltip} onClick={cloneScale} />
  )
}
export default CloneScale
