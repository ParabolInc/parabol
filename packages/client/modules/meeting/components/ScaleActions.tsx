import React from 'react'
import DetailAction from '../../../components/DetailAction'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import {Threshold} from '../../../types/constEnums'
import AddPokerTemplateScaleMutation from '../../../mutations/AddPokerTemplateScaleMutation'
import RemovePokerTemplateScaleMutation from '../../../mutations/RemovePokerTemplateScaleMutation'
import styled from '@emotion/styled'
import {commitLocalUpdate} from 'react-relay'

const CloneAndDelete = styled('div')({
  display: 'flex',
  flexDirection: 'row',
})

interface Props {
  scaleId: string
  scaleCount: number
  teamId: string
  isStarter: boolean
}

const ScaleActions = (props: Props) => {
  const {
    scaleId,
    scaleCount,
    teamId,
    isStarter
  } = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const canClone = scaleCount < Threshold.MAX_RETRO_TEAM_TEMPLATES
  const canDelete = !isStarter
  const cloneTooltip = canClone ? (isStarter ? 'Clone a default scale' : 'Edit scale') : 'Too many team templates! Remove one first'
  const deleteTooltip = canDelete ? 'Delete scale' : 'Sorry you cannot delete a default scale'
  const cloneScale = () => {
    if (submitting || !canClone) return
    if (isStarter) {
      submitMutation()
      AddPokerTemplateScaleMutation(atmosphere, {parentScaleId: scaleId, teamId}, {onError, onCompleted})
    } else {
      commitLocalUpdate(atmosphere, (store) => {
        store.get(teamId)?.setValue(scaleId, 'editingScaleId')
      })
    }
  }
  const deleteScale = () => {
    if (submitting || !canDelete) return
    submitMutation()
    RemovePokerTemplateScaleMutation(atmosphere, {scaleId}, {}, onError, onCompleted)
  }
  return (
    <CloneAndDelete>
      <DetailAction disabled={!canClone} icon={isStarter ? 'content_copy' : 'edit'} tooltip={cloneTooltip} onClick={cloneScale} />
      {canDelete && <DetailAction disabled={!canDelete} icon={'delete'} tooltip={deleteTooltip} onClick={deleteScale} />}
    </CloneAndDelete>
  )
}
export default ScaleActions
