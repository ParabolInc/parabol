import type {DraggableProvided} from '@hello-pangea/dnd'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TemplateScaleValueItem_scale$key} from '~/__generated__/TemplateScaleValueItem_scale.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import RemovePokerTemplateScaleValueMutation from '~/mutations/RemovePokerTemplateScaleValueMutation'
import {Cancel as CancelIcon} from '~/ui/icons'
import type {TemplateScaleValueItem_scaleValue$key} from '../../../__generated__/TemplateScaleValueItem_scaleValue.graphql'
import {cn} from '../../../ui/cn'
import isSpecialPokerLabel from '../../../utils/isSpecialPokerLabel'
import EditableTemplateScaleValueColor from './EditableTemplateScaleValueColor'
import EditableTemplateScaleValueLabel from './EditableTemplateScaleValueLabel'

interface Props {
  isDragging: boolean
  scale: TemplateScaleValueItem_scale$key
  scaleValue: TemplateScaleValueItem_scaleValue$key
  dragProvided?: DraggableProvided
}

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
  const showHover = !isSpecial && isHover
  return (
    <div
      ref={dragProvided?.innerRef}
      {...dragProvided?.dragHandleProps}
      {...dragProvided?.draggableProps}
      className={cn(
        'flex w-full cursor-pointer items-center px-4 py-2 text-[14px] leading-6',
        (showHover || isDragging) && 'bg-surface-raised'
      )}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <EditableTemplateScaleValueColor
        scale={scale}
        scaleValueLabel={label}
        scaleValueColor={color}
      />
      <div className='flex w-full flex-col pl-4'>
        <EditableTemplateScaleValueLabel isHover={isHover} scale={scale} scaleValue={scaleValue} />
      </div>
      {!isSpecial && (
        <div
          className={cn(
            'ml-auto flex h-6 w-6 cursor-pointer items-center justify-center text-fg-secondary [&_svg]:text-[18px]',
            isHover ? 'opacity-100' : 'opacity-0'
          )}
          onClick={removeScaleValue}
        >
          <CancelIcon />
        </div>
      )}
    </div>
  )
}
export default TemplateScaleValueItem
