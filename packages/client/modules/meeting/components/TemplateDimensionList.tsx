import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
//import MoveReflectTemplateDimensionMutation from '../../../mutations/MoveReflectTemplateDimensionMutation'
import dndNoise from '../../../utils/dndNoise'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import {TemplateDimensionList_dimensions} from '../../../__generated__/TemplateDimensionList_dimensions.graphql'
import TemplateDimensionItem from './TemplateDimensionItem'

interface Props extends WithAtmosphereProps, WithMutationProps {
  isOwner: boolean
  dimensions: TemplateDimensionList_dimensions
  templateId: string
}

interface State {
  scrollOffset: number
}

const DimensionList = styled('div')({
  margin: 0,
  padding: 0,
  width: '100%'
})

const TEMPLATE_DIMENSION = 'TEMPLATE_DIMENSION'

class TemplateDimensionList extends Component<Props, State> {
  onDragEnd = (result) => {
    const {source, destination} = result
    const {dimensions} = this.props
    if (
      !destination ||
      destination.droppableId !== TEMPLATE_DIMENSION ||
      source.droppableId !== TEMPLATE_DIMENSION ||
      destination.index === source.index
    ) {
      return
    }

    const destinationDimension = dimensions[destination.index]

    let sortOrder
    if (destination.index === 0) {
      sortOrder = destinationDimension.sortOrder - 1 + dndNoise()
    } else if (destination.index === dimensions.length - 1) {
      sortOrder = destinationDimension.sortOrder + 1 + dndNoise()
    } else {
      const offset = source.index > destination.index ? -1 : 1
      sortOrder =
        (dimensions[destination.index + offset].sortOrder + destinationDimension.sortOrder) / 2 +
        dndNoise()
    }

    console.log(`sortOrder = ${sortOrder}`)
    //MoveReflectTemplateDimensionMutation(atmosphere, variables, {templateId})
  }

  render() {
    const {isOwner, dimensions} = this.props
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <DimensionList>
          <Droppable droppableId={TEMPLATE_DIMENSION} isDropDisabled={!isOwner}>
            {(provided) => {
              return (
                <div ref={provided.innerRef}>
                  {dimensions.map((dimension, idx) => {
                    return (
                      <Draggable
                        key={dimension.id}
                        draggableId={dimension.id}
                        index={idx}
                        isDragDisabled={!isOwner}
                      >
                        {(dragProvided, dragSnapshot) => {
                          return (
                            <TemplateDimensionItem
                              isOwner={isOwner}
                              dimension={dimension}
                              dimensions={dimensions}
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
        </DimensionList>
      </DragDropContext>
    )
  }
}

export default createFragmentContainer(withAtmosphere(withMutationProps(TemplateDimensionList)), {
  dimensions: graphql`
    fragment TemplateDimensionList_dimensions on TemplateDimension @relay(plural: true) {
      id
      sortOrder
      scale {
        name
      }
      sortOrder
      ...TemplateDimensionItem_dimension
      ...TemplateDimensionItem_dimensions
    }
  `
})