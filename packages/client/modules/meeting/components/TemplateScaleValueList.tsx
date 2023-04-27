import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {DragDropContext, Draggable, Droppable, DropResult} from 'react-beautiful-dnd'
import {useFragment} from 'react-relay'
import {TemplateScaleValueList_scale$key} from '~/__generated__/TemplateScaleValueList_scale.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import MovePokerTemplateScaleValueMutation from '../../../mutations/MovePokerTemplateScaleValueMutation'
import {TEMPLATE_SCALE_VALUE} from '../../../utils/constants'
import isSpecialPokerLabel from '../../../utils/isSpecialPokerLabel'
import AddScaleValueButtonInput from './AddScaleValueButtonInput'
import TemplateScaleValueItem from './TemplateScaleValueItem'

interface Props {
  isOwner: boolean
  scale: TemplateScaleValueList_scale$key
}

const ScaleList = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  width: '100%'
})

const TemplateScaleValueList = (props: Props) => {
  const {isOwner, scale: scaleRef} = props
  const scale = useFragment(
    graphql`
      fragment TemplateScaleValueList_scale on TemplateScale {
        ...TemplateScaleValueItem_scale
        ...AddScaleValueButtonInput_scale
        id
        values {
          id
          label
          ...TemplateScaleValueItem_scaleValue
        }
      }
    `,
    scaleRef
  )
  const {values} = scale
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const atmosphere = useAtmosphere()

  const onDragEnd = (result: DropResult) => {
    const {source, destination} = result
    if (!destination) return
    const {values: scaleValues} = scale
    const sourceScaleValue = scaleValues[source.index]
    if (
      destination.droppableId !== TEMPLATE_SCALE_VALUE ||
      source.droppableId !== TEMPLATE_SCALE_VALUE ||
      destination.index === source.index ||
      !sourceScaleValue
    ) {
      return
    }
    submitMutation()

    const variables = {scaleId: scale.id, label: sourceScaleValue.label, index: destination.index}
    MovePokerTemplateScaleValueMutation(atmosphere, variables, {onError, onCompleted})
  }

  return (
    <ScaleList>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={TEMPLATE_SCALE_VALUE} isDropDisabled={!isOwner}>
          {(provided) => {
            return (
              <div ref={provided.innerRef}>
                {values
                  .filter(({label}) => !isSpecialPokerLabel(label))
                  .map((scaleValue, idx) => (
                    <Draggable
                      key={scaleValue.id}
                      draggableId={scaleValue.id}
                      index={idx}
                      isDragDisabled={!isOwner || submitting}
                    >
                      {(dragProvided, dragSnapshot) => {
                        return (
                          <TemplateScaleValueItem
                            scale={scale}
                            scaleValue={scaleValue}
                            isDragging={dragSnapshot.isDragging}
                            dragProvided={dragProvided}
                          />
                        )
                      }}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )
          }}
        </Droppable>
      </DragDropContext>
      <AddScaleValueButtonInput scale={scale} />
      {values
        .filter(({label}) => isSpecialPokerLabel(label))
        .map((scaleValue) => (
          <TemplateScaleValueItem
            key={scaleValue.id}
            scale={scale}
            scaleValue={scaleValue}
            isDragging={false}
          />
        ))}
    </ScaleList>
  )
}

export default TemplateScaleValueList
