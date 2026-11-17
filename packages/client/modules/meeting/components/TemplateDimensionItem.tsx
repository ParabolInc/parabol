import type {DraggableProvided} from '@hello-pangea/dnd'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TemplateDimensionItem_dimensions$key} from '~/__generated__/TemplateDimensionItem_dimensions.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import RemovePokerTemplateDimensionMutation from '~/mutations/RemovePokerTemplateDimensionMutation'
import {Cancel as CancelIcon} from '~/ui/icons'
import type {TemplateDimensionItem_dimension$key} from '../../../__generated__/TemplateDimensionItem_dimension.graphql'
import {cn} from '../../../ui/cn'
import EditableTemplateDimension from './EditableTemplateDimension'
import PokerTemplateScalePicker from './PokerTemplateScalePicker'

interface Props {
  isOwner: boolean
  isDragging: boolean
  dimension: TemplateDimensionItem_dimension$key
  dimensions: TemplateDimensionItem_dimensions$key
  dragProvided: DraggableProvided
  readOnly?: boolean
}

const TemplateDimensionItem = (props: Props) => {
  const {
    dragProvided,
    isDragging,
    isOwner,
    dimension: dimensionRef,
    dimensions: dimensionsRef,
    readOnly
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
  const canRemove = dimensions.length > 1 && isOwner && !readOnly
  const isItemOwner = isOwner && !readOnly
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
    <div
      ref={dragProvided.innerRef}
      {...dragProvided.dragHandleProps}
      {...dragProvided.draggableProps}
      className={cn(
        'flex w-full items-center py-2 pr-4 pl-[22px] text-[14px] leading-6',
        isItemOwner && 'cursor-pointer',
        isItemOwner && (isHover || isDragging) && 'bg-surface-raised'
      )}
      onMouseOver={onMouseEnter}
      onMouseOut={onMouseLeave}
    >
      <div
        className={cn(
          'ml-auto flex h-6 w-6 cursor-pointer items-center justify-center p-0 text-fg-secondary [&_svg]:text-[18px]',
          isHover ? 'opacity-100' : 'opacity-0',
          canRemove ? 'visible' : 'invisible'
        )}
        onClick={removeDimension}
      >
        <CancelIcon />
      </div>
      <div className='flex w-full flex-col pl-4'>
        <EditableTemplateDimension
          isOwner={isItemOwner}
          isEditingDescription={isEditingDescription}
          isHover={isHover}
          dimensionName={dimensionName}
          dimensionId={dimensionId}
          dimensions={dimensions}
        />
      </div>
      <PokerTemplateScalePicker dimension={dimension} isOwner={isOwner} readOnly={readOnly} />
    </div>
  )
}
export default TemplateDimensionItem
