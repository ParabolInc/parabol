import styled from '@emotion/styled'
import React from 'react'
import FlatButton from '../../../components/FlatButton'
import Icon from '../../../components/Icon'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import RemoveReflectTemplateMutation from '../../../mutations/RemoveReflectTemplateMutation'
import {PALETTE} from '../../../styles/paletteV2'
import {ICON_SIZE} from '../../../styles/typographyV2'
import {Threshold} from '../../../types/constEnums'

const Button = styled(FlatButton)<{isVisible: boolean}>(({isVisible}) => ({
  alignItems: 'flex-end',
  display: !isVisible ? 'none' : 'flex',
  color: PALETTE.TEXT_GRAY,
  height: 32,
  justifyContent: 'flex-end',
  padding: 0,
  width: 32
}))

const ActionButton = styled(Icon)({
  fontSize: ICON_SIZE.MD18
})

interface Props {
  isOwner: boolean
  templateCount: number
  templateId
}

const CloneOrRemoveTemplate = (props: Props) => {
  const {
    templateCount,
    templateId,
    isOwner
  } = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const removeTemplate = () => {
    if (submitting) return
    if (templateCount <= 1) {
      onError(new Error('You must have at least 1 template'))
      return
    }
    submitMutation()
    RemoveReflectTemplateMutation(atmosphere, {templateId}, {}, onError, onCompleted)
  }

  const cloneTemplate = () => {
    if (submitting) return
    if (templateCount >= Threshold.MAX_RETRO_TEAM_TEMPLATES) {
      onError(new Error('Please remove a template before cloning another'))
      return
    }
  }

  if (isOwner) {
    return (
      <Button
        isVisible={templateCount > 1}
        onClick={removeTemplate}
        size='small'
        waiting={submitting}
      >
        <ActionButton>delete</ActionButton>
      </Button>
    )
  }
  return (
    <Button
      isVisible={templateCount < Threshold.MAX_RETRO_TEAM_TEMPLATES}
      onClick={cloneTemplate}
      size='small'
      waiting={submitting}
    >
      <ActionButton>content_copy</ActionButton>
    </Button>
  )

}
export default CloneOrRemoveTemplate
