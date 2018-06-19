// @flow
/* global HTMLElement, Node */

import * as React from 'react'
import styled, {css} from 'react-emotion'
import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard'
import {createFragmentContainer} from 'react-relay'
import type {ReflectionGroup_reflectionGroup as ReflectionGroupType} from './__generated__/ReflectionGroup_reflectionGroup.graphql'
import type {ReflectionGroup_meeting as Meeting} from './__generated__/ReflectionGroup_meeting.graphql'
import ui from 'universal/styles/ui'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import ReflectionGroupHeader from 'universal/components/ReflectionGroupHeader'
import {REFLECTION_CARD, REFLECTION_GROUP, VOTE} from 'universal/utils/constants'
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard'
import {DropTarget as dropTarget} from '@mattkrick/react-dnd'
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {CARD_PADDING, MODAL_PADDING} from 'universal/utils/multiplayerMasonry/masonryConstants'
import Modal from 'universal/components/Modal'
import initializeModalGrid from 'universal/utils/multiplayerMasonry/initializeModalGrid'

const {Component} = React

export type Props = {|
  atmosphere: Object,
  canDrop: boolean,
  connectDropTarget: () => Node,
  meeting: Meeting,
  reflectionGroup: ReflectionGroupType,
  retroPhaseItemId: string,
  ...MutationProps
|}

type State = {
  isExpanded: boolean
}

const reflectionsStyle = (canDrop) =>
  css({
    cursor: 'pointer',
    opacity: canDrop ? 0.6 : 1,
    position: 'relative'
  })

const ReflectionCardInStack = styled('div')({
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: ui.shadow[0],
  opacity: 1,
  overflow: 'hidden',
  position: 'absolute',
  left: 6,
  top: 6,
  right: -6,
  bottom: -2,
  zIndex: -1
})

const Group = styled('div')(
  {
    padding: CARD_PADDING
  },
  ({isExpanded}) =>
    isExpanded && {
      backgroundColor: 'rgba(0,0,0,0)',
      borderRadius: 6,
      overflow: 'hidden',
      padding: MODAL_PADDING,
      position: 'absolute',
      transition: 'all 300ms',
      zIndex: 100
    }
)

// const ReflectionHiddenInStack = styled('div')({
//   opacity: 0,
//   position: 'absolute'
// })

class ReflectionGroup extends Component<Props, State> {
  state = {isExpanded: false}

  componentDidUpdate (prevProps, prevState) {
    if (!prevState.isExpanded && this.state.isExpanded) {
      const {childrenCache, itemCache, parentCache, reflectionGroup} = this.props
      const {reflectionGroupId, reflections} = reflectionGroup
      initializeModalGrid(reflections, parentCache, itemCache, childrenCache[reflectionGroupId])
    }
  }

  onClose = () => {
    this.setState({
      isExpanded: false
    })
    const {
      childrenCache,
      reflectionGroup: {reflectionGroupId}
    } = this.props
    // const {boundingBox: {left: parentLeft, top: parentTop}} = parentCache
    const {
      boundingBox: {left, top}
    } = childrenCache[reflectionGroupId]
    this.modalRef.style.transition = 'transform 300ms'
    this.modalRef.style.transform = `translate(${left}px,${top}px)`
  }

  renderReflection = (reflection: Object, idx: number) => {
    const {setItemRef, meeting, reflectionGroup} = this.props
    const {reflections} = reflectionGroup
    const {isExpanded} = this.state
    if (isExpanded) {
      return (
        <div key={reflection.id} style={{position: 'absolute'}}>
          <DraggableReflectionCard
            meeting={meeting}
            reflection={reflection}
            setItemRef={setItemRef}
          />
        </div>
      )
    }

    if (idx === 0) {
      return (
        <div key={reflection.id}>
          <DraggableReflectionCard
            meeting={meeting}
            reflection={reflection}
            setItemRef={setItemRef}
            isSingleCardGroup={reflections.length === 1}
          />
        </div>
      )
    }

    if (idx === 1) {
      return (
        <ReflectionCardInStack key={reflection.id}>
          <ReflectionCard meeting={meeting} reflection={reflection} showOriginFooter hideShadow />
        </ReflectionCardInStack>
      )
    }
    return null
  }

  toggleExpand = () => {
    this.setState({
      isExpanded: !this.state.isExpanded
    })
  }

  setModalRef = (c) => {
    const {
      reflectionGroup: {reflectionGroupId, reflections}
    } = this.props
    const [firstReflection] = reflections
    if (c) {
      this.modalRef = c
      this.props.setChildRef(reflectionGroupId, firstReflection.id)(c)
    }
  }

  render () {
    const {canDrop, connectDropTarget, meeting, reflectionGroup} = this.props
    const {reflections} = reflectionGroup
    const {
      localPhase: {phaseType}
    } = meeting
    const {isExpanded, modalCoords} = this.state
    const showHeader = reflections.length > 1 || phaseType === VOTE
    if (isExpanded) {
      return (
        <Modal clickToClose escToClose isOpen onClose={this.onClose}>
          <Group innerRef={this.setModalRef} isExpanded={isExpanded}>
            {showHeader && (
              <ReflectionGroupHeader meeting={meeting} reflectionGroup={reflectionGroup} />
            )}
            {/* connect the drop target here so dropping on the title triggers an ungroup */}
            {connectDropTarget(
              <div className={reflectionsStyle(canDrop)} onClick={this.toggleExpand}>
                {reflections.map(this.renderReflection)}
              </div>
            )}
          </Group>
        </Modal>
      )
    }
    return (
      <Group innerRef={this.setModalRef} isExpanded={isExpanded} modalCoords={modalCoords}>
        {showHeader && (
          <ReflectionGroupHeader meeting={meeting} reflectionGroup={reflectionGroup} />
        )}
        {/* connect the drop target here so dropping on the title triggers an ungroup */}
        {connectDropTarget(
          <div className={reflectionsStyle(canDrop)} onClick={this.toggleExpand}>
            {reflections.map(this.renderReflection)}
          </div>
        )}
      </Group>
    )
  }
}

const reflectionDropSpec = {
  canDrop (props: Props, monitor) {
    return (
      monitor.isOver() &&
      monitor.getItem().reflectionGroupId !== props.reflectionGroup.reflectionGroupId
    )
  },

  drop (props: Props, monitor) {
    if (monitor.didDrop()) return
    const {reflectionGroup} = props
    const {reflectionGroupId: targetReflectionGroupId} = reflectionGroup
    return {dropTargetType: REFLECTION_GROUP, dropTargetId: targetReflectionGroupId}
  }
}

const reflectionDropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: monitor.canDrop()
})

export default createFragmentContainer(
  withAtmosphere(
    withMutationProps(
      dropTarget(REFLECTION_CARD, reflectionDropSpec, reflectionDropCollect)(ReflectionGroup)
    )
  ),
  graphql`
    fragment ReflectionGroup_meeting on RetrospectiveMeeting {
      meetingId: id
      ...ReflectionCard_meeting
      ...ReflectionGroupHeader_meeting
      localPhase {
        phaseType
      }
    }

    fragment ReflectionGroup_reflectionGroup on RetroReflectionGroup {
      ...ReflectionGroupHeader_reflectionGroup
      retroPhaseItemId
      reflectionGroupId: id
      sortOrder
      reflections {
        id
        retroPhaseItemId
        sortOrder
        ...DraggableReflectionCard_reflection
        ...ReflectionCard_reflection
      }
    }
  `
)
