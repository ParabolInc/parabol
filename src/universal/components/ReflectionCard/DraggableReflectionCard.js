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
import {css} from 'react-emotion'
import ui from 'universal/styles/ui'

type Props = {
  dndIndex: number,
  reflection: Reflection,
  showOriginFooter: boolean,
  ...ReflectionCardProps
}

const hiddenWhileDraggingStyle = css({
  opacity: 0,
  cursor: 'default'
})

const hiddenAndInvisibleWhileDraggingStyle = css({
  opacity: 0,
  cursor: 'default',
  position: 'absolute'
})

const modalTopStyle = css({
  position: 'absolute',
  zIndex: 1
})

const modalStyle = css({
  position: 'absolute',
  top: 0,
  zIndex: 1
})

const topCardStyle = css({
  position: 'relative',
  zIndex: 1
})

const secondCardStyle = css({
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: ui.shadow[0],
  overflow: 'hidden',
  position: 'absolute',
  pointerEvents: 'none',
  left: 6,
  top: 6,
  right: -6,
  bottom: -2,
  width: ui.retroCardWidth
})

const thirdPlusCardStyle = css({
  overflow: 'hidden',
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  left: 6,
  top: 6,
  right: -6,
  bottom: -2,
  width: ui.retroCardWidth
})

const getClassName = (idx, dragContext, isModal) => {
  const isTopCard = idx === 0
  const isSecondCard = idx === 1
  const isDragging = Boolean(dragContext)
  if (isDragging) {
    /*
     * To reproduce, drop card C on stack A,B in tab 1 & pick up A before C is dropped in tab 2
     * This ensures that card C lands on top of the stack instead of below it
     */
    return isTopCard ? hiddenWhileDraggingStyle : hiddenAndInvisibleWhileDraggingStyle
  }
  if (isModal) {
    /*
     * topStyle is necessary to make sure an incoming card makes it to the correct position
     * to reproduce, have group A,B,C open in tab 1
     * in tab 2, drop card D onto the group
     * card D should be in the 2nd row left column
     */
    return isTopCard ? modalTopStyle : modalStyle
  }
  if (isTopCard) return topCardStyle
  if (isSecondCard) return secondCardStyle
  return thirdPlusCardStyle
}

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
    const className = getClassName(idx, dragContext, isModal)

    return connectDragSource(
      // the `id` is in the case when the ref callback isn't called in time
      <div className={className} ref={setItemRef(reflectionId, isModal)} id={reflectionId}>
        <ReflectionCard
          meeting={meeting}
          reflection={reflection}
          isDraggable={isDraggable}
          showOriginFooter
        />
      </div>
    )
  }
}

const reflectionDragSpec = {
  canDrag (props) {
    // make sure no one is trying to drag invisible cards
    const {
      reflection: {dragContext},
      isDraggable,
      isViewerDragInProgress
    } = props
    return !dragContext && !isViewerDragInProgress && isDraggable
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
