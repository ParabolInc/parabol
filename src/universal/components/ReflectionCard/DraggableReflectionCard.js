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
import clientTempId from 'universal/utils/relay/clientTempId'
import {connect} from 'react-redux'

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
    const {connectDragSource, reflection, setItemRef, meeting} = this.props
    const {dragContext} = reflection

    const style = dragContext ? {opacity: 0, cursor: 'default'} : undefined
    return connectDragSource(
      <div style={style} ref={setItemRef}>
        <ReflectionCard meeting={meeting} reflection={reflection} showOriginFooter />
      </div>
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
      dispatch,
      reflection: {meetingId, reflectionId, reflectionGroupId},
      isSingleCardGroup
    } = props
    const initialCoords = monitor.getInitialSourceClientOffset()
    const initialCursorCoords = monitor.getInitialClientOffset()
    StartDraggingReflectionMutation(
      atmosphere,
      {reflectionId, initialCoords},
      {dispatch, initialCursorCoords, meetingId}
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
      reflection: {
        dragContext: {isViewerDragging},
        meetingId,
        reflectionId,
        reflectionGroupId
      }
    } = props
    // endDrag is also called when the viewer loses a conflict
    if (!isViewerDragging) return
    const dropResult = monitor.getDropResult()
    const {dropTargetType = null, dropTargetId = null, sortOrder} = dropResult || {}
    const newReflectionGroupId = clientTempId()
    EndDraggingReflectionMutation(
      atmosphere,
      {
        reflectionId,
        dropTargetType,
        dropTargetId,
        sortOrder
      },
      {meetingId, newReflectionGroupId}
    )
    const {eventEmitter} = atmosphere
    eventEmitter.emit('endDraggingReflection', {
      dropTargetType,
      dropTargetId,
      itemId: reflectionId,
      childId: dropTargetType ? newReflectionGroupId : undefined,
      sourceId: reflectionGroupId
    })
  }
}

const reflectionDragCollect = (connectSource) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview()
})

export default createFragmentContainer(
  connect()(
    withAtmosphere(
      dragSource(REFLECTION_CARD, reflectionDragSpec, reflectionDragCollect)(
        DraggableReflectionCard
      )
    )
  ),
  graphql`
    fragment DraggableReflectionCard_reflection on RetroReflection {
      content
      meetingId
      reflectionId: id
      reflectionGroupId
      retroPhaseItemId
      dragContext {
        dragUserId
        isViewerDragging
      }
      ...ReflectionCard_reflection
      ...ReflectionCardInFlight_reflection
    }
  `
)
