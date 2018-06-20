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
import {
  CARD_PADDING,
  ITEM_DURATION,
  MIN_ITEM_DELAY,
  MIN_VAR_ITEM_DELAY,
  MODAL_PADDING
} from 'universal/utils/multiplayerMasonry/masonryConstants'
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
  width: ui.retroCardWidth,
  zIndex: -1
})

const Group = styled('div')(
  {
    padding: CARD_PADDING,
    position: 'absolute',
    display: 'inline-block'
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

class ReflectionGroup extends Component<Props, State> {
  state = {isExpanded: false}

  componentDidUpdate (prevProps, prevState) {
    if (prevState.ixExpanded !== this.state.isExpanded) {
      if (this.state.isExpanded) {
        const {childrenCache, itemCache, parentCache, reflectionGroup} = this.props
        const {reflectionGroupId, reflections} = reflectionGroup
        initializeModalGrid(
          reflections,
          parentCache,
          itemCache,
          childrenCache[reflectionGroupId],
          this.headerRef
        )
      } else {
        const {childrenCache, reflectionGroup} = this.props
        const {reflectionGroupId} = reflectionGroup
        const {el, boundingBox} = childrenCache[reflectionGroupId]
        el.style.transition = 'all 200ms'
        el.style.transform = `translate(${boundingBox.left}px,${boundingBox.top}px)`
      }
    }
  }

  onClose = () => {
    const {
      childrenCache,
      itemCache,
      reflectionGroup: {reflectionGroupId, reflections}
    } = this.props
    const childCache = childrenCache[reflectionGroupId]
    const {el: childEl} = childCache
    const {style: childStyle} = childEl

    const firstItemHeight = itemCache[reflections[0].id].boundingBox.height
    reflections.forEach((reflection, idx) => {
      const cachedItem = itemCache[reflection.id]
      const {
        el: {style: itemStyle}
      } = cachedItem
      const cardStackOffset = idx === 0 ? 0 : 6
      itemStyle.height = `${firstItemHeight}px`
      itemStyle.overflow = 'hidden'
      itemStyle.transition = `transform ${ITEM_DURATION}ms ${MIN_VAR_ITEM_DELAY * idx}ms`
      itemStyle.transform = `translate(${cardStackOffset}px, ${cardStackOffset}px)`
    })

    // animate child home
    const childDuration = ITEM_DURATION + MIN_VAR_ITEM_DELAY * (reflections.length - 1)
    childStyle.transition = `transform ${childDuration}ms ${MIN_ITEM_DELAY}ms`
    childStyle.transform = `translate(${0}px,${0}px)`
    childStyle.backgroundColor = 'inherit'
    const closeOut = (e) => {
      if (e.target !== e.currentTarget) return
      this.setState({
        isExpanded: false
      })
      childEl.removeEventListener('transitionend', closeOut)
    }
    childEl.addEventListener('transitionend', closeOut)
  }

  renderReflection = (reflection: Object, idx: number) => {
    const {setItemRef, meeting, reflectionGroup} = this.props
    const {reflections} = reflectionGroup
    const {isExpanded} = this.state
    if (isExpanded) {
      return (
        <DraggableReflectionCard
          idx={idx}
          isExpanded={isExpanded}
          key={reflection.id}
          meeting={meeting}
          reflection={reflection}
          setItemRef={setItemRef}
        />
      )
    }

    if (idx === 0) {
      return (
        <DraggableReflectionCard
          key={reflection.id}
          meeting={meeting}
          reflection={reflection}
          setItemRef={setItemRef}
          isSingleCardGroup={reflections.length === 1}
        />
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

  setHeaderRef = (c) => {
    if (c) {
      this.headerRef = c
    }
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

  renderGroup () {
    const {canDrop, connectDropTarget, meeting, reflectionGroup} = this.props
    const {reflections} = reflectionGroup
    const {
      localPhase: {phaseType}
    } = meeting
    const {isExpanded} = this.state
    const canExpand = reflections.length > 1
    const showHeader = canExpand || phaseType === VOTE
    return (
      <Group innerRef={this.setModalRef} isExpanded={isExpanded}>
        {showHeader && (
          <ReflectionGroupHeader
            isExpanded={isExpanded}
            innerRef={this.setHeaderRef}
            meeting={meeting}
            reflectionGroup={reflectionGroup}
          />
        )}
        {/* connect the drop target here so dropping on the title triggers an ungroup */}
        {connectDropTarget(
          <div
            className={reflectionsStyle(canDrop)}
            onClick={canExpand ? this.toggleExpand : undefined}
          >
            {reflections.map(this.renderReflection)}
          </div>
        )}
      </Group>
    )
  }

  render () {
    const {isExpanded} = this.state
    if (isExpanded) {
      return (
        <Modal clickToClose escToClose isOpen onClose={this.onClose}>
          {this.renderGroup()}
        </Modal>
      )
    } else {
      return this.renderGroup()
    }
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
