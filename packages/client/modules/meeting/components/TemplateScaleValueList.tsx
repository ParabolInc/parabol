import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import {TemplateScaleValueList_scale} from '~/__generated__/TemplateScaleValueList_scale.graphql'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import dndNoise from '../../../utils/dndNoise'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import TemplateScaleValueItem from './TemplateScaleValueItem'

interface Props extends WithAtmosphereProps, WithMutationProps {
  scale: TemplateScaleValueList_scale
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
    const {scale} = this.props
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
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
}

export default createFragmentContainer(withAtmosphere(withMutationProps(TemplateScaleValueList)), {
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