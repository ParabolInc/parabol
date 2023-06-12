import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import DetailAction from '../../../components/DetailAction'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddPokerTemplateScaleMutation from '../../../mutations/AddPokerTemplateScaleMutation'
import RemovePokerTemplateScaleMutation from '../../../mutations/RemovePokerTemplateScaleMutation'
import {Threshold} from '../../../types/constEnums'
import {ScaleActions_scale$key} from '../../../__generated__/ScaleActions_scale.graphql'

const CloneAndDelete = styled('div')({
  display: 'flex',
  flexDirection: 'row'
})

interface Props {
  scale: ScaleActions_scale$key
  scaleCount: number
  teamId: string
  closeMenu: () => void
}

const ScaleActions = (props: Props) => {
  const {scale: scaleRef, scaleCount, teamId, closeMenu} = props
  const scale = useFragment(
    graphql`
      fragment ScaleActions_scale on TemplateScale {
        id
        isStarter
        teamId
      }
    `,
    scaleRef
  )
  const {id: scaleId, isStarter} = scale
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const canClone = scaleCount < Threshold.MAX_POKER_TEMPLATE_SCALES
  const cloneTooltip = canClone
    ? 'Clone default scale'
    : 'Too many team templates! Remove one first'
  const cloneScale = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (submitting || !canClone) return
    if (isStarter) {
      submitMutation()
      AddPokerTemplateScaleMutation(
        atmosphere,
        {parentScaleId: scaleId, teamId},
        {onError, onCompleted}
      )
    }
    closeMenu()
  }
  const editScale = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(teamId)?.setValue(scaleId, 'editingScaleId')
    })
  }
  const deleteScale = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (submitting) return
    submitMutation()
    RemovePokerTemplateScaleMutation(atmosphere, {scaleId}, {onError, onCompleted})
  }
  return (
    <CloneAndDelete>
      {isStarter ? (
        <DetailAction
          disabled={!canClone}
          icon={'content_copy'}
          tooltip={cloneTooltip}
          onClick={cloneScale}
        />
      ) : (
        <>
          <DetailAction icon={'edit'} tooltip={'Edit scale'} onClick={editScale} />
          <DetailAction icon={'delete'} tooltip={'Delete scale'} onClick={deleteScale} />
        </>
      )}
    </CloneAndDelete>
  )
}
export default ScaleActions
