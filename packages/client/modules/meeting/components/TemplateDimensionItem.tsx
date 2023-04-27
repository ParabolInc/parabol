import styled from '@emotion/styled'
import {Cancel as CancelIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {DraggableProvided} from 'react-beautiful-dnd'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import RemovePokerTemplateDimensionMutation from '~/mutations/RemovePokerTemplateDimensionMutation'
import {TemplateDimensionItem_dimensions$key} from '~/__generated__/TemplateDimensionItem_dimensions.graphql'
import {PALETTE} from '../../../styles/paletteV3'
import {TemplateDimensionItem_dimension$key} from '../../../__generated__/TemplateDimensionItem_dimension.graphql'
import EditableTemplateDimension from './EditableTemplateDimension'
import PokerTemplateScalePicker from './PokerTemplateScalePicker'

interface Props {
  isOwner: boolean
  isDragging: boolean
  dimension: TemplateDimensionItem_dimension$key
  dimensions: TemplateDimensionItem_dimensions$key
  dragProvided: DraggableProvided
}

interface StyledProps {
  isDragging?: boolean
  isHover?: boolean
  enabled?: boolean
}

const DimensionItem = styled('div')<StyledProps & {isOwner: boolean}>(
  ({isOwner, isHover, isDragging}) => ({
    alignItems: 'center',
    backgroundColor: isOwner && (isHover || isDragging) ? PALETTE.SLATE_100 : undefined,
    cursor: isOwner ? 'pointer' : undefined,
    display: 'flex',
    fontSize: 14,
    lineHeight: '24px',
    padding: '8px 16px 8px 22px',
    width: '100%'
  })
)

const RemoveDimensionIcon = styled('div')<StyledProps>(({isHover, enabled}) => ({
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
  visibility: enabled ? 'visible' : 'hidden',
  width: 24
}))

const DimensionAndDescription = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const TemplateDimensionItem = (props: Props) => {
  const {
    dragProvided,
    isDragging,
    isOwner,
    dimension: dimensionRef,
    dimensions: dimensionsRef
  } = props
  const dimensions = useFragment(
    graphql`
      fragment TemplateDimensionItem_dimensions on TemplateDimension @relay(plural: true) {
        ...EditableTemplateDimension_dimensions
      }
    `,
    dimensionsRef
  )
  const dimension = useFragment(
    graphql`
      fragment TemplateDimensionItem_dimension on TemplateDimension {
        ...PokerTemplateScalePicker_dimension
        id
        name
        description
      }
    `,
    dimensionRef
  )
  const {id: dimensionId, name: dimensionName} = dimension
  const [isHover, setIsHover] = useState(false)
  const [isEditingDescription] = useState(false)
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const canRemove = dimensions.length > 1 && isOwner
  const onMouseEnter = () => {
    setIsHover(true)
  }
  const onMouseLeave = () => {
    setIsHover(false)
  }
  const removeDimension = () => {
    if (submitting) return
    if (!canRemove) {
      onError(new Error('You must have at least 1 dimension'))
      return
    }
    submitMutation()
    RemovePokerTemplateDimensionMutation(atmosphere, {dimensionId}, {onError, onCompleted})
  }

  return (
    <DimensionItem
      ref={dragProvided.innerRef}
      {...dragProvided.dragHandleProps}
      {...dragProvided.draggableProps}
      isDragging={isDragging}
      isHover={isHover}
      isOwner={isOwner}
      onMouseOver={onMouseEnter}
      onMouseOut={onMouseLeave}
    >
      <RemoveDimensionIcon isHover={isHover} onClick={removeDimension} enabled={canRemove}>
        <CancelIcon />
      </RemoveDimensionIcon>
      <DimensionAndDescription>
        <EditableTemplateDimension
          isOwner={isOwner}
          isEditingDescription={isEditingDescription}
          isHover={isHover}
          dimensionName={dimensionName}
          dimensionId={dimensionId}
          dimensions={dimensions}
        />
      </DimensionAndDescription>
      <PokerTemplateScalePicker dimension={dimension} isOwner={isOwner} />
    </DimensionItem>
  )
}
export default TemplateDimensionItem
