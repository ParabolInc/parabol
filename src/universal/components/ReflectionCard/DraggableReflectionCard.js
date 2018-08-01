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
import styled, {css} from 'react-emotion'
import ui from 'universal/styles/ui'

type Props = {
  dndIndex: number,
  reflection: Reflection,
  showOriginFooter: boolean,
  ...ReflectionCardProps
}

const dragContextStyle = css({
  opacity: 0,
  cursor: 'default'
})

const modalStyle = (isTop) =>
  css({
    position: 'absolute',
    top: !isTop && 0,
    zIndex: 1
  })

const standardStyle = css({
  position: 'relative',
  zIndex: 1
})

const ReflectionCardInStack = styled('div')(({secondCard}) => ({
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: secondCard ? ui.shadow[0] : undefined,
  opacity: secondCard ? 1 : 0,
  overflow: 'hidden',
  position: 'absolute',
  pointerEvents: 'none',
  left: 6,
  top: 6,
  right: -6,
  bottom: -2,
  width: ui.retroCardWidth
}))

class DraggableReflectionCard extends React.Component<Props> {
  componentDidMount () {
    const {connectDragPreview} = this.props
    connectDragPreview(getEmptyImage())
  }

  render () {
    const {
      connectDragSource,
      reflection,
      setItemRef,
      meeting,
      idx,
      isDraggable,
      isModal
    } = this.props
    const {dragContext, reflectionId} = reflection
    if (idx === 0) {
      const className = dragContext
        ? dragContextStyle
        : isModal
          ? modalStyle(idx === 0)
          : standardStyle
      return connectDragSource(
        <div className={className} ref={setItemRef(reflectionId, isModal)}>
          <ReflectionCard
            meeting={meeting}
            reflection={reflection}
            isDraggable={isDraggable}
            showOriginFooter
          />
        </div>
      )
    }
    return (
      <ReflectionCardInStack secondCard={idx === 1}>
        {connectDragSource(
          <div ref={setItemRef(reflectionId, isModal)}>
            <ReflectionCard
              meeting={meeting}
              reflection={reflection}
              isDraggable={isDraggable}
              showOriginFooter
            />
          </div>
        )}
      </ReflectionCardInStack>
    )
  }
}

const reflectionDragSpec = {
  canDrag (props) {
    // make sure no one is trying to drag invisible cards
    const {
      reflection: {dragContext},
      isDraggable,
      isOptimisticEndDrag
    } = props
    return !dragContext && !isOptimisticEndDrag && isDraggable
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
      closeGroupModal,
      reflection: {
        dragContext: {dragId, isViewerDragging},
        meetingId,
        reflectionId,
        reflectionGroupId
      }
    } = props
    // endDrag is also called when the viewer loses a conflict
    if (!isViewerDragging) return
    const dropResult = monitor.getDropResult()
    const {dropTargetType = null, dropTargetId = null} = dropResult || {}
    // must come before the mutation so we can clear the itemCache
    if (closeGroupModal && dropTargetType) {
      closeGroupModal()
    }
    const newReflectionGroupId = clientTempId()
    EndDraggingReflectionMutation(
      atmosphere,
      {
        reflectionId,
        dropTargetType,
        dropTargetId,
        dragId
      },
      {meetingId, newReflectionGroupId}
    )
    const {eventEmitter} = atmosphere
    eventEmitter.emit('endDraggingReflection', {
      dragId,
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
        dragId: id
        dragUserId
        isViewerDragging
      }
      ...ReflectionCard_reflection
      ...ReflectionCardInFlight_reflection
    }
  `
)
