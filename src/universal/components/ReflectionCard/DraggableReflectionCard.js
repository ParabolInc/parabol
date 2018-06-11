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

type Props = {
  dndIndex: number,
  reflection: Reflection,
  showOriginFooter: boolean,
  ...ReflectionCardProps
}

class DraggableReflectionCard extends React.Component<Props> {
  constructor (props) {
    super(props)
    const {
      atmosphere: {eventEmitter},
      reflection: {reflectionId}
    } = props
    eventEmitter.on(`dragReflection.${reflectionId}`, this.handleDragEnd)
  }
  state = {
    isTeamMemberDragging: false,
    closingTransform: undefined
  }

  componentDidMount () {
    // this._mounted = true
    const {connectDragPreview} = this.props
    connectDragPreview(getEmptyImage())
  }

  // componentWillUnmount() {
  // this._mounted = false
  // }

  handleDragEnd = (payload) => {
    const {dropTargetType} = payload
    if (dropTargetType === null) {
      const {left, top} = this.reflectionRef.getBoundingClientRect()
      this.setState({
        closingTransform: `translate3d(${left}px, ${top}px, 0px)`
      })
    }
  }

  handleTransitionEnd = () => {
    const {
      atmosphere,
      reflection: {reflectionId}
    } = this.props
    commitLocalUpdate(atmosphere, (store) => {
      const reflection = store.get(reflectionId)
      const dragContext = reflection.getLinkedRecord('dragContext')
      dragContext.setValue(null, 'dragCoords')
      reflection.setValue(null, 'dragContext')
    })
    this.setState({
      closingTransform: undefined
    })
  }

  setReflectionRef = (c) => {
    if (c) {
      this.reflectionRef = c
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
    const {closingTransform} = this.state
    const isTeamMemberDragging = Boolean(
      reflection.dragContext && reflection.dragContext.dragCoords
    )

    const style = {
      opacity: +(closingTransform ? 0 : !isDragging && !isTeamMemberDragging)
    }
    console.log('team drag', isTeamMemberDragging, isDragging, reflection.dragContext)
    return (
      <React.Fragment>
        {connectDragSource(
          <div style={style} ref={this.setReflectionRef}>
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
            closingTransform={closingTransform}
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
  endDrag (props: Props, monitor) {
    const {
      atmosphere,
      reflection: {reflectionId, reflectionGroupId}
    } = props
    console.log('end drag', monitor.didDrop(), monitor.getDropResult())
    const dropResult = monitor.getDropResult()
    const dropTargetType = dropResult ? dropResult.dropTargetType : null
    DragReflectionMutation(atmosphere, {reflectionId, isDragging: false, dropTargetType})
    const {eventEmitter} = atmosphere
    eventEmitter.emit(`dragReflection.${reflectionId}`, {
      dropTargetType,
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
