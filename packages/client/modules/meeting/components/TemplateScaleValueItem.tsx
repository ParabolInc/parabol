import styled from '@emotion/styled'
import {Cancel as CancelIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {DraggableProvided} from 'react-beautiful-dnd'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import RemovePokerTemplateScaleValueMutation from '~/mutations/RemovePokerTemplateScaleValueMutation'
import {TemplateScaleValueItem_scale$key} from '~/__generated__/TemplateScaleValueItem_scale.graphql'
import {PALETTE} from '../../../styles/paletteV3'
import isSpecialPokerLabel from '../../../utils/isSpecialPokerLabel'
import {TemplateScaleValueItem_scaleValue$key} from '../../../__generated__/TemplateScaleValueItem_scaleValue.graphql'
import EditableTemplateScaleValueColor from './EditableTemplateScaleValueColor'
import EditableTemplateScaleValueLabel from './EditableTemplateScaleValueLabel'

interface Props {
  isDragging: boolean
  scale: TemplateScaleValueItem_scale$key
  scaleValue: TemplateScaleValueItem_scaleValue$key
  dragProvided?: DraggableProvided
}

const ScaleValueItem = styled('div')<{isHover: boolean; isDragging: boolean}>(
  ({isHover, isDragging}) => ({
    alignItems: 'center',
    backgroundColor: isHover || isDragging ? PALETTE.SLATE_100 : undefined,
    cursor: 'pointer',
    display: 'flex',
    fontSize: 14,
    lineHeight: '24px',
    padding: '8px 16px',
    width: '100%'
  })
)

const RemoveScaleValueIcon = styled('div')<{isHover: boolean}>(({isHover}) => ({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  svg: {
    fontSize: 18
  },
  height: 24,
  marginLeft: 'auto',
  padding: 0,
  opacity: isHover ? 1 : 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 24
}))

const ScaleAndDescription = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const TemplateScaleValueItem = (props: Props) => {
  const {dragProvided, isDragging, scale: scaleRef, scaleValue: scaleValueRef} = props
  const scale = useFragment(
    graphql`
      fragment TemplateScaleValueItem_scale on TemplateScale {
        id
        ...EditableTemplateScaleValueLabel_scale
        ...EditableTemplateScaleValueColor_scale
      }
    `,
    scaleRef
  )
  const scaleValue = useFragment(
    graphql`
      fragment TemplateScaleValueItem_scaleValue on TemplateScaleValue {
        ...EditableTemplateScaleValueLabel_scaleValue
        id
        label
        color
      }
    `,
    scaleValueRef
  )
  const {id: scaleId} = scale
  const {label, color} = scaleValue
  const [isHover, setIsHover] = useState(false)
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const onMouseOver = () => {
    setIsHover(true)
  }
  const onMouseOut = () => {
    setIsHover(false)
  }
  const removeScaleValue = () => {
    if (submitting) return
    submitMutation()
    RemovePokerTemplateScaleValueMutation(atmosphere, {scaleId, label}, {onError, onCompleted})
  }
  const isSpecial = isSpecialPokerLabel(label)
  return (
    <ScaleValueItem
      ref={dragProvided?.innerRef}
      {...dragProvided?.dragHandleProps}
      {...dragProvided?.draggableProps}
      isDragging={isDragging}
      isHover={!isSpecial && isHover}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <EditableTemplateScaleValueColor
        scale={scale}
        scaleValueLabel={label}
        scaleValueColor={color}
      />
      <ScaleAndDescription>
        <EditableTemplateScaleValueLabel isHover={isHover} scale={scale} scaleValue={scaleValue} />
      </ScaleAndDescription>
      {!isSpecial && (
        <RemoveScaleValueIcon isHover={isHover} onClick={removeScaleValue}>
          <CancelIcon />
        </RemoveScaleValueIcon>
      )}
    </ScaleValueItem>
  )
}
export default TemplateScaleValueItem
