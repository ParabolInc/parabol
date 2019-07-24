import {DraggableReflectionCard_reflection} from '../../__generated__/DraggableReflectionCard_reflection.graphql'
/**
 * A drag-and-drop enabled reflection card.
 *
 */
import React, {Component, ReactElement} from 'react'
import {DragSource as dragSource} from 'react-dnd'
import {getEmptyImage} from 'react-dnd-html5-backend'
import {createFragmentContainer, graphql} from 'react-relay'
import withAtmosphere, {WithAtmosphereProps} from '../../decorators/withAtmosphere/withAtmosphere'
import EndDraggingReflectionMutation from '../../mutations/EndDraggingReflectionMutation'
import StartDraggingReflectionMutation from '../../mutations/StartDraggingReflectionMutation'
import {
  cardBackgroundColor,
  cardBorderRadius,
  cardStackPerspectiveX,
  cardStackPerspectiveY
} from '../../styles/cards'
import {cardShadow} from '../../styles/elevation'
import {REFLECTION_CARD} from '../../utils/constants'
import {REFLECTION_CARD_WIDTH} from '../../utils/multiplayerMasonry/masonryConstants'
import clientTempId from '../../utils/relay/clientTempId'
import {MasonryAtmosphere, MasonryDragEndPayload, SetItemRef} from '../PhaseItemMasonry'
import {MasonryDropResult} from '../ReflectionGroup/ReflectionGroup'
import ReflectionCard from './ReflectionCard'
import {ClassNames} from '@emotion/core'

interface Props extends WithAtmosphereProps {
  closeGroupModal?(): void

  connectDragPreview(reactEl: HTMLImageElement): void

  connectDragSource(reactEl: ReactElement<{}>): ReactElement<{}>

  reflection: DraggableReflectionCard_reflection

  setItemRef: SetItemRef

  meeting: any
  idx: number
  isDraggable: boolean
  isModal: boolean
  isSingleCardGroup: boolean
}

const hiddenWhileDraggingStyle = {
  opacity: 0,
  cursor: 'default'
}

const hiddenAndInvisibleWhileDraggingStyle = {
  opacity: 0,
  cursor: 'default',
  position: 'absolute'
}

const modalTopStyle = {
  position: 'absolute',
  zIndex: 1
}

const modalStyle = {
  position: 'absolute',
  top: 0,
  zIndex: 1
}

const hiddenCardStyle = {
  overflow: 'hidden',
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  left: 6,
  top: 6,
  right: -6,
  bottom: -2,
  width: REFLECTION_CARD_WIDTH
}

const HIDE_LINES_HACK_STYLES = {
  background: cardBackgroundColor,
  content: '""',
  height: 12,
  left: 0,
  position: 'absolute' as 'absolute',
  right: 0,
  zIndex: 200
}

const CARD_IN_STACK = {
  backgroundColor: cardBackgroundColor,
  borderRadius: cardBorderRadius,
  boxShadow: cardShadow,
  cursor: 'pointer',
  overflow: 'hidden',
  position: 'absolute' as 'absolute',
  pointerEvents: 'none' as 'none',
  zIndex: 1,
  // hides partially overflown top lines of text
  '&::before': {
    ...HIDE_LINES_HACK_STYLES,
    top: 0
  },
  // hides partially overflown bottom lines of text
  '&::after': {
    ...HIDE_LINES_HACK_STYLES,
    bottom: 0
  },
  '& > div': {
    bottom: 0,
    boxShadow: 'none',
    left: 0,
    position: 'absolute' as 'absolute',
    right: 0,
    top: 0,
    zIndex: 100
  }
}

const topCardStyle = {
  cursor: 'pointer',
  position: 'relative',
  zIndex: 2
}

const secondCardStyle = {
  ...CARD_IN_STACK,
  bottom: -cardStackPerspectiveY,
  left: cardStackPerspectiveX,
  right: cardStackPerspectiveX,
  top: cardStackPerspectiveY,
  '& > div > div': {
    transform: 'scale(.95)',
    transformOrigin: 'left',
    width: REFLECTION_CARD_WIDTH
  }
} as any

const thirdCardStyle = {
  ...CARD_IN_STACK,
  bottom: -(cardStackPerspectiveY * 2),
  left: cardStackPerspectiveX * 2,
  right: cardStackPerspectiveX * 2,
  top: cardStackPerspectiveY * 2
} as any

const getStyleObj = (idx: number, dragContext: any, isModal: boolean) => {
  const isTopCard = idx === 0
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
  switch (idx) {
    case 0:
      return topCardStyle
    case 1:
      return secondCardStyle
    case 2:
      return thirdCardStyle
    default:
      return hiddenCardStyle
  }
}

class DraggableReflectionCard extends Component<Props> {
  componentDidMount () {
    const {connectDragPreview} = this.props
    connectDragPreview(getEmptyImage())
  }

  render () {
    const {connectDragSource, reflection, setItemRef, idx, isModal} = this.props
    const {dragContext, reflectionId} = reflection
    return (
      <ClassNames>
        {({css}) => {
          return (
            connectDragSource(
              // the `id` is in the case when the ref callback isn't called in time
              <div className={css(getStyleObj(idx, dragContext, isModal))} ref={setItemRef(reflectionId, isModal)} id={reflectionId}>
                <ReflectionCard readOnly userSelect='none' reflection={reflection} showOriginFooter />
              </div>
            )
          )
        }}
      </ClassNames>

    )
  }
}

const reflectionDragSpec = {
  canDrag (props: Props) {
    // make sure no one is trying to drag invisible cards
    const {
      meeting: {isViewerDragInProgress},
      reflection: {dragContext},
      isDraggable
    } = props
    return !dragContext && !isViewerDragInProgress && isDraggable
  },

  beginDrag (props: Props, monitor) {
    const {
      atmosphere,
      reflection: {meetingId, reflectionId, reflectionGroupId},
      isSingleCardGroup
    } = props
    const initialCoords = monitor.getInitialSourceClientOffset()
    const initialCursorCoords = monitor.getInitialClientOffset()
    StartDraggingReflectionMutation(
      atmosphere as MasonryAtmosphere,
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
      closeGroupModal,
      reflection: {dragContext, meetingId, reflectionId, reflectionGroupId}
    } = props
    // endDrag is also called when the viewer loses a conflict
    if (!dragContext || !dragContext.isViewerDragging) return
    const dragId = dragContext.dragId as string
    const dropResult = monitor.getDropResult() as MasonryDropResult | null
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
    } as MasonryDragEndPayload)
  }
}

const reflectionDragCollect = (connectSource) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview()
})

export default createFragmentContainer(
  withAtmosphere(
    (dragSource(REFLECTION_CARD, reflectionDragSpec, reflectionDragCollect) as any)(
      DraggableReflectionCard
    )
  ),
  {
    reflection: graphql`
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
  }
)
