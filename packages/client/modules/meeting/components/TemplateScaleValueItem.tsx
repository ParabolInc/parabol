import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {DraggableProvided} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import RemovePokerTemplateScaleValueMutation from '~/mutations/RemovePokerTemplateScaleValueMutation'
import {TemplateScaleValueItem_scale} from '~/__generated__/TemplateScaleValueItem_scale.graphql'
import Icon from '../../../components/Icon'
import {PALETTE} from '../../../styles/paletteV2'
import {ICON_SIZE} from '../../../styles/typographyV2'
import {TemplateScaleValueItem_scaleValue} from '../../../__generated__/TemplateScaleValueItem_scaleValue.graphql'
import EditableTemplateScaleValueColor from './EditableTemplateScaleValueColor'
import EditableTemplateScaleValueLabel from './EditableTemplateScaleValueLabel'

interface Props {
  isOwner: boolean
  isDragging: boolean
  scale: TemplateScaleValueItem_scale
  scaleValue: TemplateScaleValueItem_scaleValue
  dragProvided: DraggableProvided
}

interface StyledProps {
  isDragging?: boolean
  isHover?: boolean
}

const ScaleValueItem = styled('div')<StyledProps & {isOwner: boolean}>(
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

const RemoveScaleValueIcon = styled(Icon)<StyledProps>(({isHover}) => ({
  color: PALETTE.TEXT_GRAY,
  cursor: 'pointer',
  display: 'block',
  fontSize: ICON_SIZE.MD18,
  height: ICON_SIZE.MD24,
  width: ICON_SIZE.MD24,
  lineHeight: '24px',
  marginLeft: 'auto',
  padding: 0,
  opacity: isHover ? 1 : 0,
  textAlign: 'center'
}))

const ScaleAndDescription = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const TemplateScaleValueItem = (props: Props) => {
  const {dragProvided, isDragging, isOwner, scale, scaleValue} = props
  const {id: scaleId} = scale
  const {label, color} = scaleValue
  const [isHover, setIsHover] = useState(false)
  const [isEditingScaleValueLabel] = useState(false)
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const onMouseOver = () => {
    setIsHover(true)
  }
  const onMouseLeave = () => {
    setIsHover(false)
  }
  const removeScaleValue = () => {
    if (submitting) return
    submitMutation()
    RemovePokerTemplateScaleValueMutation(atmosphere, {scaleId, label}, {}, onError, onCompleted)
  }
  return (
    <ScaleValueItem
      ref={dragProvided.innerRef}
      {...dragProvided.dragHandleProps}
      {...dragProvided.draggableProps}
      isDragging={isDragging}
      isHover={isHover}
      isOwner={isOwner}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      <EditableTemplateScaleValueColor isOwner={isOwner} scale={scale}
        scaleValueLabel={label} scaleValueColor={color} />
      <ScaleAndDescription>
        <EditableTemplateScaleValueLabel
          isOwner={isOwner}
          isHover={isHover}
          isEditingLabel={isEditingScaleValueLabel}
          scale={scale}
          scaleValue={scaleValue}
        />
      </ScaleAndDescription>
      <RemoveScaleValueIcon isHover={isHover} onClick={removeScaleValue}>
        cancel
      </RemoveScaleValueIcon>
    </ScaleValueItem >
  )
}
export default createFragmentContainer(TemplateScaleValueItem, {
  scale: graphql`
    fragment TemplateScaleValueItem_scale on TemplateScale {
      id
      ...EditableTemplateScaleValueLabel_scale
      ...EditableTemplateScaleValueColor_scale
    }
  `,
  scaleValue: graphql`
    fragment TemplateScaleValueItem_scaleValue on TemplateScaleValue {
      ...EditableTemplateScaleValueLabel_scaleValue
      id
      label
      isSpecial
      color
    }
  `
})
