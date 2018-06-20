// @flow
/* global HTMLElement, Node */

import * as React from 'react'
import styled, {css} from 'react-emotion'
import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
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
  EXIT_DURATION,
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
  ({isModal}) =>
    isModal && {
      backgroundColor: 'rgba(0,0,0,0)',
      borderRadius: 6,
      overflow: 'hidden',
      padding: MODAL_PADDING,
      position: 'absolute',
      zIndex: 100
    },
  ({isHidden}) =>
    isHidden && {
      opacity: 0,
      pointerEvents: 'none'
    }
)

class ReflectionGroup extends Component<Props> {
  componentDidUpdate (prevProps) {
    const {
      reflectionGroup: {isExpanded: wasExpanded}
    } = prevProps
    const {
      reflectionGroup: {isExpanded}
    } = this.props
    if (wasExpanded !== isExpanded) {
      if (isExpanded) {
        const {childrenCache, itemCache, parentCache, reflectionGroup} = this.props
        const {reflectionGroupId, reflections} = reflectionGroup
        initializeModalGrid(
          reflections,
          parentCache,
          itemCache,
          childrenCache[reflectionGroupId],
          this.headerRef,
          this.modalRef
        )
      }
    }
  }

  closeGroupModal = () => {
    const {
      atmosphere,
      childrenCache,
      itemCache,
      reflectionGroup: {isExpanded, reflectionGroupId, reflections}
    } = this.props
    if (!isExpanded) return
    const {style: modalStyle} = this.modalRef

    const firstItemHeight = itemCache[reflections[0].id].boundingBox.height
    reflections.forEach((reflection, idx) => {
      const cachedItem = itemCache[reflection.id]
      const {
        modalEl: {style: itemStyle}
      } = cachedItem
      const cardStackOffset = idx === 0 ? 0 : 6
      itemStyle.height = `${firstItemHeight}px`
      itemStyle.overflow = 'hidden'
      itemStyle.transition = `transform ${EXIT_DURATION}ms ${MIN_VAR_ITEM_DELAY * idx}ms`
      itemStyle.transform = `translate(${cardStackOffset}px, ${cardStackOffset}px)`
    })

    // animate child home
    const childDuration = EXIT_DURATION + MIN_VAR_ITEM_DELAY * (reflections.length - 1)
    modalStyle.transition = `all ${childDuration}ms ${MIN_ITEM_DELAY}ms`
    modalStyle.transform = `translate(${0}px,${0}px)`
    modalStyle.backgroundColor = ''
    const closeOut = (e) => {
      if (e.target !== e.currentTarget) return
      childrenCache[reflectionGroupId].el.style.opacity = ''
      commitLocalUpdate(atmosphere, (store) => {
        store.get(reflectionGroupId).setValue(false, 'isExpanded')
      })
      reflections.forEach((reflection) => {
        delete itemCache[reflection.id].modalEl
      })
      this.modalRef.removeEventListener('transitionend', closeOut)
    }
    this.modalRef.addEventListener('transitionend', closeOut)
  }

  promoteModalItemtoGrid = (itemId) => {
    const {itemCache} = this.props
    itemCache[itemId].el = itemCache[itemId].modalEl
  }

  renderReflection = (isModal, reflection: Object, idx: number) => {
    const {setItemRef, meeting, reflectionGroup} = this.props
    const {reflections} = reflectionGroup
    if (isModal) {
      return (
        <DraggableReflectionCard
          closeGroupModal={this.closeGroupModal}
          idx={idx}
          isModal
          key={reflection.id}
          meeting={meeting}
          promoteModalItemtoGrid={this.promoteModalItemtoGrid}
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

    if (idx > 0) {
      return (
        <ReflectionCardInStack key={reflection.id}>
          <ReflectionCard meeting={meeting} reflection={reflection} showOriginFooter hideShadow />
        </ReflectionCardInStack>
      )
    }
  }

  expandGroup = () => {
    const {
      atmosphere,
      reflectionGroup: {isExpanded, reflectionGroupId}
    } = this.props
    if (!isExpanded) {
      commitLocalUpdate(atmosphere, (store) => {
        store.get(reflectionGroupId).setValue(true, 'isExpanded')
      })
    }
  }

  setHeaderRef = (c) => {
    if (c) {
      this.headerRef = c
    }
  }

  setModalRef = (c) => {
    if (c) {
      this.modalRef = c
    }
  }

  render () {
    const {canDrop, connectDropTarget, meeting, reflectionGroup, setChildRef} = this.props
    const {isExpanded, reflections, reflectionGroupId} = reflectionGroup
    const {
      localPhase: {phaseType}
    } = meeting
    const canExpand = !isExpanded && reflections.length > 1
    const showHeader = reflections.length > 1 || phaseType === VOTE
    const [firstReflection] = reflections
    // always render the in-grid group so we can get a read on the size if the title is removed
    return (
      <React.Fragment>
        <Group innerRef={setChildRef(reflectionGroupId, firstReflection.id)} isHidden={isExpanded}>
          {showHeader && (
            <ReflectionGroupHeader
              innerRef={this.setHeaderRef}
              meeting={meeting}
              reflectionGroup={reflectionGroup}
            />
          )}
          {/* connect the drop target here so dropping on the title triggers an ungroup */}
          {connectDropTarget(
            <div
              className={reflectionsStyle(canDrop)}
              onClick={canExpand ? this.expandGroup : undefined}
            >
              {reflections.map((reflection, idx) => this.renderReflection(false, reflection, idx))}
            </div>
          )}
        </Group>
        <Modal clickToClose escToClose isOpen={isExpanded} onClose={this.closeGroupModal}>
          <Group innerRef={this.setModalRef} isModal>
            <ReflectionGroupHeader
              isExpanded={isExpanded}
              innerRef={this.setHeaderRef}
              meeting={meeting}
              reflectionGroup={reflectionGroup}
            />
            <div className={reflectionsStyle(canDrop, isExpanded)}>
              {reflections.map((reflection, idx) => this.renderReflection(true, reflection, idx))}
            </div>
          </Group>
        </Modal>
      </React.Fragment>
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
      isExpanded
    }
  `
)
