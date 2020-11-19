import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import {TemplateScaleValueList_scale} from '~/__generated__/TemplateScaleValueList_scale.graphql'
import dndNoise from '../../../utils/dndNoise'
import TemplateScaleValueItem from './TemplateScaleValueItem'

interface Props {
  scale: TemplateScaleValueList_scale
}

const ScaleList = styled('div')({
  margin: 0,
  padding: 0,
  width: '100%'
})

const TEMPLATE_DIMENSION = 'TEMPLATE_DIMENSION'

const TemplateScaleValueList = (props: Props) => {
  const {scale} = props

  const onDragEnd = (result) => {
    const {source, destination} = result
    console.log(`${source}:${destination}; ${dndNoise}`)
    // const {atmosphere, scaleValues} = props
    // if (
    //   !destination ||
    //   destination.droppableId !== TEMPLATE_DIMENSION ||
    //   source.droppableId !== TEMPLATE_DIMENSION ||
    //   destination.index === source.index
    // ) {
    //   return
    // }

    // const sourceScale = scaleValues[source.index]
    // const destinationScale = scaleValues[destination.index]

    // let sortOrder
    // if (destination.index === 0) {
    //   sortOrder = destinationScale.sortOrder - 1 + dndNoise()
    // } else if (destination.index === scaleValues.length - 1) {
    //   sortOrder = destinationScale.sortOrder + 1 + dndNoise()
    // } else {
    //   const offset = source.index > destination.index ? -1 : 1
    //   sortOrder =
    //     (scaleValues[destination.index + offset].sortOrder + destinationScale.sortOrder) / 2 +
    //     dndNoise()
    // }

    // const {id: scaleId} = sourceScale
    // const variables = {scaleId, sortOrder}
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ScaleList>
        <Droppable droppableId={TEMPLATE_DIMENSION} isDropDisabled={false}>
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
      ...TemplateScaleValueItem_scale
      values {
        id
        isSpecial
        ...TemplateScaleValueItem_scaleValue
      }
    }
  `
})