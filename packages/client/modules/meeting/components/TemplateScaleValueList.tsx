import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import {TemplateScaleValueList_scale} from '~/__generated__/TemplateScaleValueList_scale.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import MovePokerTemplateScaleValueMutation from '../../../mutations/MovePokerTemplateScaleValueMutation'
import TemplateScaleValueItem from './TemplateScaleValueItem'

interface Props {
  scale: TemplateScaleValueList_scale
}

const ScaleList = styled('div')({
  margin: 0,
  padding: 0,
  width: '100%'
})

const TEMPLATE_SCALE_VALUE = 'TEMPLATE_SCALE_VALUE'

const TemplateScaleValueList = (props: Props) => {
  const {scale} = props
  const {onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()

  const onDragEnd = (result) => {
    const {source, destination} = result
    const {values: scaleValues} = scale
    if (
      !destination ||
      destination.droppableId !== TEMPLATE_SCALE_VALUE ||
      source.droppableId !== TEMPLATE_SCALE_VALUE ||
      destination.index === source.index
    ) {
      return
    }

    const sourceScaleValue = scaleValues[source.index]

    const variables = {scaleId: scale.id, label: sourceScaleValue.label, index: destination.index}
    MovePokerTemplateScaleValueMutation(atmosphere, variables, {onError, onCompleted})
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ScaleList>
        <Droppable droppableId={TEMPLATE_SCALE_VALUE} isDropDisabled={false}>
          {(provided) => {
            return (
              <div ref={provided.innerRef}>
                {scale.values.map((scaleValue, idx) => {
                  return (
                    <Draggable
                      key={scaleValue.id}
                      draggableId={scaleValue.id}
                      index={idx}
                      isDragDisabled={scaleValue.isSpecial}
                    >
                      {(dragProvided, dragSnapshot) => {
                        return (
                          <TemplateScaleValueItem
                            isOwner={!scaleValue.isSpecial}
                            scale={scale}
                            scaleValue={scaleValue}
                            isDragging={dragSnapshot.isDragging}
                            dragProvided={dragProvided}
                          />
                        )
                      }}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )
          }}
        </Droppable>
      </ScaleList>
    </DragDropContext>
  )
}

export default createFragmentContainer(TemplateScaleValueList, {
  scale: graphql`
    fragment TemplateScaleValueList_scale on TemplateScale {
      id
      ...TemplateScaleValueItem_scale
      values {
        id
        label
        isSpecial
        ...TemplateScaleValueItem_scaleValue
      }
    }
  `
})