import styled from '@emotion/styled'
import React from 'react'
import FlatButton from '../../../components/FlatButton'
import Icon from '../../../components/Icon'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../hooks/useCoords'
import useMutationProps from '../../../hooks/useMutationProps'
import useTooltip from '../../../hooks/useTooltip'
import RemoveReflectTemplateMutation from '../../../mutations/RemoveReflectTemplateMutation'
import {PALETTE} from '../../../styles/paletteV2'
import {ICON_SIZE} from '../../../styles/typographyV2'
import {Threshold} from '../../../types/constEnums'

const Button = styled(FlatButton)<{isVisible: boolean}>(({isVisible}) => ({
  alignItems: 'center',
  display: !isVisible ? 'none' : 'flex',
  color: PALETTE.TEXT_GRAY,
  height: 32,
  justifyContent: 'center',
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
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER
  )
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
      <>
        <Button
          ref={originRef}
          isVisible={templateCount > 1}
          onClick={removeTemplate}
          size='small'
          waiting={submitting}
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
        >
          <ActionButton>delete</ActionButton>
        </Button>
        {tooltipPortal(<div>Delete template</div>)}
      </>
    )
  }
  return (
    <>
      <Button
        ref={originRef}
        isVisible={templateCount < Threshold.MAX_RETRO_TEAM_TEMPLATES}
        onClick={cloneTemplate}
        size='small'
        waiting={submitting}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
      >
        <ActionButton>content_copy</ActionButton>
      </Button>
      {tooltipPortal(<div>Clone & Edit Template</div>)}
    </>
  )

}
export default CloneOrRemoveTemplate
