/**
 * A drag-and-drop enabled reflection card.
 *
 * @flow
 */
import * as React from 'react'
import type {Props as ReflectionCardProps} from './ReflectionCard'
import ReflectionCard from './ReflectionCard'
import {createFragmentContainer} from 'react-relay'
import type {DraggableReflectionCard_reflection as Reflection} from './__generated__/DraggableReflectionCard_reflection.graphql'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DragSource as dragSource} from '@mattkrick/react-dnd'
import {REFLECTION_CARD} from 'universal/utils/constants'
import EndDraggingReflectionMutation from 'universal/mutations/EndDraggingReflectionMutation'
import {getEmptyImage} from '@mattkrick/react-dnd-html5-backend'
import StartDraggingReflectionMutation from 'universal/mutations/StartDraggingReflectionMutation'

type Props = {
  dndIndex: number,
  reflection: Reflection,
  showOriginFooter: boolean,
  ...ReflectionCardProps
}

class DraggableReflectionCard extends React.Component<Props> {
  componentDidMount () {
    const {connectDragPreview} = this.props
    connectDragPreview(getEmptyImage())
  }

  render () {
    const {connectDragSource, reflection, meeting} = this.props
    const {dragContext} = reflection

    const style = {
      opacity: dragContext ? 0 : 1
    }
    return (
      <React.Fragment>
        {connectDragSource(
          <div style={style}>
            <ReflectionCard meeting={meeting} reflection={reflection} showOriginFooter />
          </div>
        )}
      </React.Fragment>
    )
  }
}

const reflectionDragSpec = {
  canDrag (props) {
    // make sure no one is trying to drag invisible cards
    const {
      reflection: {dragContext}
    } = props
    return !dragContext || dragContext.isViewerDragging
  },

  beginDrag (props, monitor) {
    const {
      atmosphere,
      reflection: {meetingId, reflectionId, reflectionGroupId},
      isSingleCardGroup
    } = props
    const initialCoords = monitor.getInitialSourceClientOffset()
    const initialCursorCoords = monitor.getInitialClientOffset()
    StartDraggingReflectionMutation(
      atmosphere,
      {reflectionId, initialCoords},
      {initialCursorCoords, meetingId}
    )
    return {
      reflectionId,
      reflectionGroupId,
      isSingleCardGroup
    }
  },

  endDrag (props: Props, monitor) {
    const {
      atmosphere,
      reflection: {reflectionId, reflectionGroupId}
    } = props
    const dropResult = monitor.getDropResult()
    const {dropTargetType = null, dropTargetId = null} = dropResult || {}
    EndDraggingReflectionMutation(atmosphere, {
      reflectionId,
      dropTargetType,
      dropTargetId
    })
    const {eventEmitter} = atmosphere
    eventEmitter.emit('endDraggingReflection', {
      dropTargetType,
      dropTargetId,
      itemId: reflectionId,
      childId: reflectionGroupId
    })
  }
}

const reflectionDragCollect = (connectSource) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview()
})

export default createFragmentContainer(
  withAtmosphere(
    dragSource(REFLECTION_CARD, reflectionDragSpec, reflectionDragCollect)(DraggableReflectionCard)
  ),
  graphql`
    fragment DraggableReflectionCard_reflection on RetroReflection {
      content
      reflectionId: id
      reflectionGroupId
      retroPhaseItemId
      dragContext {
        dragUserId
      }
      ...ReflectionCard_reflection
      ...ReflectionCardInFlight_reflection
    }
  `
)
