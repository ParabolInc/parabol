// @flow

import * as React from 'react'
import styled, {css} from 'react-emotion'
import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import type {ReflectionGroup_reflectionGroup as ReflectionGroupType} from './__generated__/ReflectionGroup_reflectionGroup.graphql'
import type {ReflectionGroup_meeting as Meeting} from './__generated__/ReflectionGroup_meeting.graphql'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import ReflectionGroupHeader from 'universal/components/ReflectionGroupHeader'
import {GROUP, REFLECTION_CARD, REFLECTION_GROUP, VOTE} from 'universal/utils/constants'
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
import {STANDARD_CURVE} from 'universal/styles/animation'
import updateReflectionsInModal from 'universal/utils/multiplayerMasonry/updateReflectionsInModal'
import getScaledModalBackground from 'universal/utils/multiplayerMasonry/getScaledModalBackground'
// import {modalShadow} from 'universal/styles/elevation'

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

const reflectionsStyle = (canDrop, isDraggable, canExpand) =>
  css({
    cursor: isDraggable || canExpand ? 'pointer' : 'default',
    opacity: canDrop ? 0.6 : 1,
    position: 'relative'
  })

// use a background so we can use scale instead of width/height for 60fps animations
const Background = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0
})

const Group = styled('div')(
  {
    padding: CARD_PADDING,
    position: 'absolute',
    display: 'inline-block',
    // necessary for smooth updating column heights
    transition: 'transform 200ms'
  },
  ({isModal}) =>
    isModal && {
      borderRadius: 6,
      overflow: 'hidden',
      padding: MODAL_PADDING,
      position: 'absolute',
      transition: 'unset',
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
      reflectionGroup: {isExpanded: wasExpanded, reflections: oldReflections}
    } = prevProps
    const {childrenCache, itemCache, parentCache, reflectionGroup} = this.props
    const {isExpanded, reflectionGroupId, reflections} = reflectionGroup
    if (wasExpanded !== isExpanded) {
      if (isExpanded) {
        initializeModalGrid(
          reflections,
          parentCache,
          itemCache,
          childrenCache[reflectionGroupId],
          this.headerRef,
          this.modalRef,
          this.backgroundRef
        )
      }
    }
    if (this.modalRef && reflections.length !== oldReflections.length && !this.isClosing) {
      const oldReflectionsIds = new Set(oldReflections.map((reflection) => reflection.id))
      const newReflections = reflections.filter(
        (reflection) => !oldReflectionsIds.has(reflection.id)
      )
      const itemIds = newReflections.map((reflection) => reflection.id)
      updateReflectionsInModal(
        reflections,
        parentCache,
        itemCache,
        childrenCache[reflectionGroupId],
        this.headerRef,
        this.modalRef,
        this.backgroundRef,
        itemIds
      )
    }
  }

  isClosing = false
  backgroundRef: ?HTMLElement = null
  headerRef: ?HTMLElement = null
  modalRef: ?HTMLElement = null

  closeGroupModal = () => {
    const {
      atmosphere,
      childrenCache,
      parentCache,
      itemCache,
      reflectionGroup: {isExpanded, reflectionGroupId, reflections}
    } = this.props
    if (!isExpanded || !this.modalRef || !this.backgroundRef) return
    const {
      boundingBox: {left: parentLeft, top: parentTop}
    } = parentCache
    const {style: modalStyle} = this.modalRef
    const {style: backgroundStyle} = this.backgroundRef
    const firstItemHeight = itemCache[reflections[0].id].boundingBox.height
    const childDuration = EXIT_DURATION + MIN_VAR_ITEM_DELAY * (reflections.length - 1)

    // set starting item styles
    reflections.forEach((reflection, idx) => {
      const cachedItem = itemCache[reflection.id]
      const {
        modalEl: {style: itemStyle}
      } = cachedItem
      const cardStackOffset = idx === reflections.length - 1 ? 0 : 6
      const delay = MIN_VAR_ITEM_DELAY * (reflections.length - 1 - idx)
      itemStyle.height = `${firstItemHeight}px`
      itemStyle.overflow = 'hidden'
      itemStyle.transition = `transform ${EXIT_DURATION}ms ${delay}ms ${STANDARD_CURVE}`
      itemStyle.transform = `translate(${cardStackOffset}px, ${cardStackOffset}px)`
    })
    const {boundingBox} = childrenCache[reflectionGroupId]
    const {top: collapsedTop, left: collapsedLeft} = boundingBox
    const top = collapsedTop + parentTop - MODAL_PADDING + CARD_PADDING
    const left = collapsedLeft + parentLeft - MODAL_PADDING + CARD_PADDING
    // animate child home
    modalStyle.transition = `all ${childDuration}ms ${MIN_ITEM_DELAY}ms ${STANDARD_CURVE}`
    modalStyle.transform = `translate(${left}px,${top}px)`
    modalStyle.overflow = 'hidden'

    // animate background home
    const childCache = childrenCache[reflectionGroupId]
    const {
      modalBoundingBox: {height: modalHeight, width: modalWidth},
      headerHeight
    } = childCache
    backgroundStyle.transition = `all ${childDuration}ms ${STANDARD_CURVE}`
    backgroundStyle.transform = getScaledModalBackground(
      modalHeight,
      modalWidth,
      firstItemHeight,
      headerHeight
    )
    backgroundStyle.backgroundColor = ''

    this.isClosing = true
    const reset = (e) => {
      this.isClosing = false
      if (e.target !== e.currentTarget) return
      const childCache = childrenCache[reflectionGroupId]
      childCache.headerHeight = undefined
      childCache.modalBoundingBox = undefined
      childrenCache[reflectionGroupId].el.style.opacity = ''
      commitLocalUpdate(atmosphere, (store) => {
        store.get(reflectionGroupId).setValue(false, 'isExpanded')
      })
      reflections.forEach((reflection) => {
        itemCache[reflection.id].modalEl = undefined
      })
      if (this.modalRef) {
        this.modalRef.removeEventListener('transitionend', reset)
      }
    }
    // $FlowFixMe
    this.modalRef.addEventListener('transitionend', reset)
  }

  renderReflection = (reflection: Object, idx: number, {isModal, isDraggable}) => {
    const {setItemRef, meeting, reflectionGroup} = this.props
    const {reflections} = reflectionGroup
    const {isViewerDragInProgress} = meeting
    return (
      <DraggableReflectionCard
        closeGroupodal={isModal ? this.closeGroupModal : undefined}
        key={reflection.id}
        idx={reflections.length - idx - 1}
        isDraggable={isDraggable}
        isModal={isModal}
        meeting={meeting}
        reflection={reflection}
        setItemRef={setItemRef}
        isSingleCardGroup={reflections.length === 1}
        isViewerDragInProgress={isViewerDragInProgress}
      />
    )
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
    this.headerRef = c
  }

  setModalRef = (c) => {
    this.modalRef = c
  }

  setBackgroundRef = (c) => {
    this.backgroundRef = c
  }

  render () {
    const {canDrop, connectDropTarget, meeting, reflectionGroup, setChildRef} = this.props
    const {isExpanded, reflections, reflectionGroupId} = reflectionGroup
    const {
      localPhase: {phaseType},
      localStage: {isComplete}
    } = meeting
    const canExpand = !isExpanded && reflections.length > 1
    const showHeader = reflections.length > 1 || phaseType === VOTE
    const [firstReflection] = reflections
    const isDraggable = phaseType === GROUP && !isComplete
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
              className={reflectionsStyle(canDrop, isDraggable, canExpand)}
              onClick={canExpand ? this.expandGroup : undefined}
            >
              {reflections.map((reflection, idx) =>
                this.renderReflection(reflection, idx, {isModal: false, isDraggable})
              )}
            </div>
          )}
        </Group>
        <Modal clickToClose escToClose isOpen={isExpanded} onClose={this.closeGroupModal}>
          <Group innerRef={this.setModalRef} isModal>
            <Background innerRef={this.setBackgroundRef} />
            <ReflectionGroupHeader
              isExpanded={isExpanded}
              innerRef={this.setHeaderRef}
              meeting={meeting}
              reflectionGroup={reflectionGroup}
            />
            <div className={reflectionsStyle(canDrop, isDraggable, canExpand)}>
              {reflections.map((reflection, idx) =>
                this.renderReflection(reflection, idx, {isModal: true, isDraggable})
              )}
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
      localStage {
        isComplete
      }
      isViewerDragInProgress
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
