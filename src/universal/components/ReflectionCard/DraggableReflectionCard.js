/**
 * A drag-and-drop enabled reflection card.
 *
 * @flow
 */
import * as React from 'react'
import type {Props as ReflectionCardProps} from './ReflectionCard'
import ReflectionCard from './ReflectionCard'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import type {DraggableReflectionCard_reflection as Reflection} from './__generated__/DraggableReflectionCard_reflection.graphql'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DragSource as dragSource} from 'react-dnd'
import {REFLECTION_CARD} from 'universal/utils/constants'
import DragReflectionMutation from 'universal/mutations/DragReflectionMutation'
import ReflectionCardInFlight from 'universal/components/ReflectionCardInFlight'
import Modal from 'universal/components/Modal'
import {getEmptyImage} from 'react-dnd-html5-backend'
import resetDragContext from 'universal/utils/multiplayerMasonry/resetDragContext'

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

  onTransitionEnd = undefined

  handleTransitionEnd = () => {
    const {
      atmosphere,
      reflection: {reflectionId}
    } = this.props
    if (this.onTransitionEnd) {
      // if dropped successfully, this will be a thunk that calls updateReflectionLocation
      this.onTransitionEnd()
      this.onTransitionEnd = undefined
    } else {
      commitLocalUpdate(atmosphere, (store) => {
        const reflection = store.get(reflectionId)
        resetDragContext(reflection)
      })
    }
  }

  render () {
    const {
      connectDragSource,
      initialCursorOffset,
      initialComponentOffset,
      isDragging,
      reflection,
      meeting,
      setInFlightCoords
    } = this.props
    const isTeamMemberDragging = Boolean(
      reflection.dragContext && reflection.dragContext.dragCoords
    )
    const isClosing = Boolean(reflection.dragContext && reflection.dragContext.closingTransform)

    const style = {
      opacity: +(isClosing ? 0 : !isDragging && !isTeamMemberDragging)
    }
    return (
      <React.Fragment>
        {connectDragSource(
          <div style={style}>
            <ReflectionCard meeting={meeting} reflection={reflection} showOriginFooter />
          </div>
        )}
        <Modal isOpen={isDragging || isTeamMemberDragging || isClosing}>
          <ReflectionCardInFlight
            setInFlightCoords={setInFlightCoords}
            initialCursorOffset={initialCursorOffset}
            initialComponentOffset={initialComponentOffset}
            isDragging={isDragging}
            isTeamMemberDragging={isTeamMemberDragging}
            reflection={reflection}
            handleTransitionEnd={isClosing ? this.handleTransitionEnd : undefined}
          />
        </Modal>
      </React.Fragment>
    )
  }
}

const reflectionDragSpec = {
  canDrag (props) {
    // make sure no one is trying to drag invisible cards
    const {reflection} = props
    const isTeamMemberDragging = reflection.dragContext && reflection.dragContext.dragCoords
    const isClosing = reflection.dragContext && reflection.dragContext.closingTransform
    return !isTeamMemberDragging && !isClosing
  },

  beginDrag (props, monitor, component) {
    const {
      atmosphere,
      reflection: {reflectionId, reflectionGroupId},
      isSingleCardGroup
    } = props
    DragReflectionMutation(atmosphere, {reflectionId, isDragging: true})
    return {
      reflectionId,
      reflectionGroupId,
      isSingleCardGroup,
      getCardRect: component.getCardRect
    }
  },

  endDrag (props: Props, monitor, component) {
    const {
      atmosphere,
      reflection: {reflectionId, reflectionGroupId}
    } = props
    const dropResult = monitor.getDropResult()
    const {dropTargetType = null, dropTargetId = null, updateLocation} = dropResult || {}
    DragReflectionMutation(atmosphere, {
      reflectionId,
      isDragging: false,
      dropTargetType,
      dropTargetId
    })
    component.onTransitionEnd = updateLocation
    const {eventEmitter} = atmosphere
    eventEmitter.emit('dragReflection', {
      dropTargetType,
      dropTargetId,
      itemId: reflectionId,
      childId: reflectionGroupId
    })
  }
}

const reflectionDragCollect = (connectSource, monitor) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview(),
  isDragging: monitor.isDragging(),
  initialCursorOffset: monitor.getInitialClientOffset(),
  initialComponentOffset: monitor.getInitialSourceClientOffset()
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
        closingTransform
        draggerUserId
        dragCoords {
          x
        }
      }
      ...ReflectionCard_reflection
      ...ReflectionCardInFlight_reflection
    }
  `
)
