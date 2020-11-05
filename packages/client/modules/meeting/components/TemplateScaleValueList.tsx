import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import dndNoise from '../../../utils/dndNoise'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import {TemplateScaleValueList_scaleValues} from '../../../__generated__/TemplateScaleValueList_scaleValues.graphql'
import TemplateScaleValueItem from './TemplateScaleValueItem'

interface Props extends WithAtmosphereProps, WithMutationProps {
  isOwner: boolean
  scaleValues: TemplateScaleValueList_scaleValues
}

interface State {
  scrollOffset: number
}

const ScaleList = styled('div')({
  margin: 0,
  padding: 0,
  width: '100%'
})

const TEMPLATE_DIMENSION = 'TEMPLATE_DIMENSION'

class TemplateScaleValueList extends Component<Props, State> {
  onDragEnd = (result) => {
    const {source, destination} = result
    console.log(`${source}:${destination}; ${dndNoise}`)
    // const {atmosphere, scaleValues} = this.props
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

  render() {
    const {isOwner, scaleValues} = this.props
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <ScaleList>
          <Droppable droppableId={TEMPLATE_DIMENSION} isDropDisabled={!isOwner}>
            {(provided) => {
              return (
                <div ref={provided.innerRef}>
                  {scaleValues.map((scale, idx) => {
                    return (
                      <Draggable
                        key={scale.id}
                        draggableId={scale.id}
                        index={idx}
                        isDragDisabled={!isOwner}
                      >
                        {(dragProvided, dragSnapshot) => {
                          return (
                            <TemplateScaleValueItem
                              isOwner={isOwner}
                              scaleValue={scale}
                              scaleValues={scaleValues}
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
}

export default createFragmentContainer(withAtmosphere(withMutationProps(TemplateScaleValueList)), {
  scaleValues: graphql`
    fragment TemplateScaleValueList_scaleValues on TemplateScaleValue @relay(plural: true) {
      id
      ...TemplateScaleValueItem_scaleValue
      ...TemplateScaleValueItem_scaleValues
    }
  `
})