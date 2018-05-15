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
import {DragSource as dragSource} from 'react-dnd'
import {REFLECTION_CARD} from 'universal/utils/constants'
import styled from 'react-emotion'
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

const DragStyles = styled('div')(({isDragging}) => ({
  opacity: isDragging ? 0 : 1,
  margin: 8
}))

class DraggableReflectionCard extends React.Component<Props> {
  componentDidMount () {
    const {connectDragPreview} = this.props
    connectDragPreview(getEmptyImage())
  }

  reflectionRef = React.createRef()

  render () {
    const {
      connectDragSource,
      initialCursorOffset,
      initialComponentOffset,
      isCollapsed,
      isDragging,
      isOver,
      reflection,
      meeting,
      showOriginFooter
    } = this.props
    const {dragContext} = reflection
    const isTeamMemberDragging = !isDragging && Boolean(dragContext && dragContext.dragCoords)
    return (
      <React.Fragment>
        {connectDragSource(
          <div>
            <DragStyles isDragging={isDragging || isTeamMemberDragging} isOver={isOver}>
              <ReflectionCard
                isCollapsed={isCollapsed}
                meeting={meeting}
                reflection={reflection}
                showOriginFooter={showOriginFooter}
              />
            </DragStyles>
          </div>
        )}
        <Modal isOpen={isDragging}>
          <ReflectionCardInFlight
            initialCursorOffset={initialCursorOffset}
            initialComponentOffset={initialComponentOffset}
            isTeamMemberDragging={isTeamMemberDragging}
            reflection={reflection}
          />
        </Modal>
      </React.Fragment>
    )
  }
}

const reflectionDragSpec = {
  beginDrag (props) {
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
      isSingleCardGroup
    }
  },
  // isDragging(props, monitor) {
  //   return props.reflection.reflectionId === monitor.getItem().reflectionId;
  // },
  endDrag (props: Props) {
    const {
      atmosphere,
      reflection: {reflectionId}
    } = props
    DragReflectionMutation(atmosphere, {reflectionId, isDragging: false})
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
