import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {DraggableProvided} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import {TemplateScaleValueItem_scaleValue} from '../../../__generated__/TemplateScaleValueItem_scaleValue.graphql'
import {TemplateScaleValueItem_scaleValues} from '../../../__generated__/TemplateScaleValueItem_scaleValues.graphql'
import Icon from '../../../components/Icon'
import {PALETTE} from '../../../styles/paletteV2'
import {ICON_SIZE} from '../../../styles/typographyV2'
import EditableTemplateScaleValue from './EditableTemplateScaleValue'
import EditableTemplateScaleValueColor from './EditableTemplateScaleValueColor'

interface Props {
  isOwner: boolean
  isDragging: boolean
  scaleValue: TemplateScaleValueItem_scaleValue
  scaleValues: TemplateScaleValueItem_scaleValues
  dragProvided: DraggableProvided
}

interface StyledProps {
  isDragging?: boolean
  isHover?: boolean
  enabled?: boolean
}

const ScaleItem = styled('div')<StyledProps & {isOwner: boolean}>(
  ({isOwner, isHover, isDragging}) => ({
    alignItems: 'center',
    backgroundColor:
      isOwner && (isHover || isDragging) ? PALETTE.BACKGROUND_MAIN_LIGHTENED : undefined,
    cursor: isOwner ? 'pointer' : undefined,
    display: 'flex',
    fontSize: 14,
    lineHeight: '24px',
    padding: '8px 16px',
    width: '100%'
  })
)

const RemoveScaleIcon = styled(Icon)<StyledProps>(({isHover, enabled}) => ({
  color: PALETTE.TEXT_GRAY,
  cursor: 'pointer',
  display: 'block',
  fontSize: ICON_SIZE.MD24,
  lineHeight: '24px',
  marginLeft: 'auto',
  padding: 0,
  opacity: isHover ? 1 : 0,
  textAlign: 'center',
  visibility: enabled ? 'visible' : 'hidden'
}))

const ScaleAndDescription = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const TemplateScaleValueItem = (props: Props) => {
  const {dragProvided, isDragging, isOwner, scaleValue, scaleValues} = props
  const {id: scaleValueId, label: scaleValueLabel} = scaleValue
  const [isHover, setIsHover] = useState(false)
  const [isEditingDescription] = useState(false)
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const canRemove = scaleValues.length > 1 && isOwner
  const onMouseEnter = () => {
    setIsHover(true)
  }
  const onMouseLeave = () => {
    setIsHover(false)
  }
  const removeScale = () => {
    if (submitting) return
    if (!canRemove) {
      onError(new Error('You must have at least 1 scale'))
      return
    }
    submitMutation()
    //RemovePokerTemplateScaleMutation(atmosphere, {scaleValueId}, {}, onError, onCompleted)
    console.log(`scaleValueId = ${scaleValueId}; onCompleted = ${onCompleted}; atmosphere = ${atmosphere}`)
  }

  return (
    <ScaleItem
      ref={dragProvided.innerRef}
      {...dragProvided.dragHandleProps}
      {...dragProvided.draggableProps}
      isDragging={isDragging}
      isHover={isHover}
      isOwner={isOwner}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <EditableTemplateScaleValueColor isOwner={isOwner} scaleValue={scaleValue} scaleValues={scaleValues} />
      <ScaleAndDescription>
        <EditableTemplateScaleValue
          isOwner={isOwner}
          isEditingDescription={isEditingDescription}
          isHover={isHover}
          scaleValueLabel={scaleValueLabel}
          scaleValueId={scaleValueId}
          scaleValues={scaleValues}
        />
      </ScaleAndDescription>
      <RemoveScaleIcon isHover={isHover} onClick={removeScale} enabled={canRemove}>
        cancel
      </RemoveScaleIcon>
    </ScaleItem >
  )
}
export default createFragmentContainer(TemplateScaleValueItem, {
  scaleValues: graphql`
    fragment TemplateScaleValueItem_scaleValues on TemplateScaleValue @relay(plural: true) {
      ...EditableTemplateScaleValueColor_scaleValues
      ...EditableTemplateScaleValue_scaleValues
    }
  `,
  scaleValue: graphql`
    fragment TemplateScaleValueItem_scaleValue on TemplateScaleValue {
      ...EditableTemplateScaleValueColor_scaleValue
      id
      value
      label
      isSpecial
    }
  `
})
