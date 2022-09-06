import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import DetailAction from '../../../components/DetailAction'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddPokerTemplateScaleMutation from '../../../mutations/AddPokerTemplateScaleMutation'
import RemovePokerTemplateScaleMutation from '../../../mutations/RemovePokerTemplateScaleMutation'
import {Threshold} from '../../../types/constEnums'
import {ScaleActions_scale} from '../../../__generated__/ScaleActions_scale.graphql'

const CloneAndDelete = styled('div')({
  display: 'flex',
  flexDirection: 'row'
})

interface Props {
  scale: ScaleActions_scale
  scaleCount: number
  teamId: string
}

const ScaleActions = (props: Props) => {
  const {scale, scaleCount, teamId} = props

  //FIXME i18n: Clone default scale
  //FIXME i18n: Too many team templates! Remove one first
  const {t} = useTranslation()

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
          icon={t('ScaleActions.ContentCopy')}
          tooltip={cloneTooltip}
          onClick={cloneScale}
        />
      ) : (
        <>
          <DetailAction
            icon={t('ScaleActions.Edit')}
            tooltip={t('ScaleActions.EditScale')}
            onClick={editScale}
          />
          <DetailAction
            icon={t('ScaleActions.Delete')}
            tooltip={t('ScaleActions.DeleteScale')}
            onClick={deleteScale}
          />
        </>
      )}
    </CloneAndDelete>
  )
}
export default createFragmentContainer(ScaleActions, {
  scale: graphql`
    fragment ScaleActions_scale on TemplateScale {
      id
      isStarter
      teamId
    }
  `
})
