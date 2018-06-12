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
    // this._mounted = true
    const {connectDragPreview} = this.props
    connectDragPreview(getEmptyImage())
  }

  componentWillUnmount () {
    // this._mounted = false
    console.log('turning off drag reflection')
  }

  onTransitionEnd = undefined

  handleTransitionEnd = () => {
    const {
      atmosphere,
      reflection: {reflectionId}
    } = this.props
    console.log('handle tranny end')
    if (this.onTransitionEnd) {
      // if dropped on a group, this will be a thunk that calls updateReflectionLocation, which internally does what the else clause below does
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
      isCollapsed,
      isDragging,
      reflection,
      meeting,
      idx,
      reflectionGroupId,
      setInFlightCoords
    } = this.props
    const isTeamMemberDragging = Boolean(
      reflection.dragContext && reflection.dragContext.dragCoords
    )
    const {closingTransform} = reflection.dragContext || {}
    const style = {
      opacity: +(closingTransform ? 0 : !isDragging && !isTeamMemberDragging)
    }
    // console.log('in flight open', reflection.reflectionId, isDragging, isTeamMemberDragging, closingTransform)
    // console.log('team drag', isTeamMemberDragging, isDragging, reflection.dragContext)
    return (
      <React.Fragment>
        {connectDragSource(
          <div style={style}>
            <ReflectionCard
              isCollapsed={isCollapsed}
              meeting={meeting}
              reflection={reflection}
              showOriginFooter
              idx={idx}
              reflectionGroupId={reflectionGroupId}
            />
          </div>
        )}
        <Modal isOpen={isDragging || isTeamMemberDragging || Boolean(closingTransform)}>
          <ReflectionCardInFlight
            setInFlightCoords={setInFlightCoords}
            initialCursorOffset={initialCursorOffset}
            initialComponentOffset={initialComponentOffset}
            isDragging={isDragging}
            isTeamMemberDragging={isTeamMemberDragging}
            reflection={reflection}
            handleTransitionEnd={closingTransform ? this.handleTransitionEnd : undefined}
          />
        </Modal>
      </React.Fragment>
    )
  }
}

const reflectionDragSpec = {
  beginDrag (props, monitor, component) {
    const {
      atmosphere,
      reflection: {reflectionId, reflectionGroupId},
      currentRetroPhaseItemId,
      isSingleCardGroup
    } = props
    DragReflectionMutation(atmosphere, {reflectionId, isDragging: true})
    return {
      reflectionId,
      reflectionGroupId,
      currentRetroPhaseItemId,
      isSingleCardGroup,
      getCardRect: component.getCardRect
    }
  },
  // isDragging(props, monitor) {
  //   return props.reflection.reflectionId === monitor.getItem().reflectionId;
  // },
  endDrag (props: Props, monitor, component) {
    const {
      atmosphere,
      reflection: {reflectionId, reflectionGroupId}
    } = props
    console.log('end drag', monitor.didDrop(), monitor.getDropResult())
    const dropResult = monitor.getDropResult()
    const {dropTargetType = null, dropTargetId = null, updateLocation} = dropResult || {}
    DragReflectionMutation(atmosphere, {reflectionId, isDragging: false, dropTargetType})
    component.onTransitionEnd = updateLocation
    const {eventEmitter} = atmosphere
    console.log('emitting drag reflection', reflectionId)
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
