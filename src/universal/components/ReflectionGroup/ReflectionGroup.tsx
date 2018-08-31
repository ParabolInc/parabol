import {DropTarget as dropTarget} from '@mattkrick/react-dnd'
import {ReflectionGroup_meeting} from '__generated__/ReflectionGroup_meeting.graphql'
import {ReflectionGroup_reflectionGroup} from '__generated__/ReflectionGroup_reflectionGroup.graphql'
import React, {Component, ReactElement} from 'react'
import styled, {css} from 'react-emotion'
// @ts-ignore
import {commitLocalUpdate, createFragmentContainer, graphql} from 'react-relay'
import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard'
import Modal from 'universal/components/Modal'
import {MasonryChildrenCache, MasonryParentCache} from 'universal/components/ReflectionCardInFlight'
import ReflectionGroupHeader from 'universal/components/ReflectionGroupHeader'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {STANDARD_CURVE} from 'universal/styles/animation'
import {GROUP, REFLECTION_CARD, REFLECTION_GROUP, VOTE} from 'universal/utils/constants'
import getScaledModalBackground from 'universal/utils/multiplayerMasonry/getScaledModalBackground'
import initializeModalGrid from 'universal/utils/multiplayerMasonry/initializeModalGrid'
import {
  CARD_PADDING,
  EXIT_DURATION,
  MIN_ITEM_DELAY,
  MIN_VAR_ITEM_DELAY,
  MODAL_PADDING
} from 'universal/utils/multiplayerMasonry/masonryConstants'
import updateReflectionsInModal from 'universal/utils/multiplayerMasonry/updateReflectionsInModal'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithAtmosphereProps, WithMutationProps {
  canDrop: boolean
  itemCache: any
  childrenCache: MasonryChildrenCache
  parentCache: MasonryParentCache
  connectDropTarget: (reactEl: ReactElement<{}>) => ReactElement<{}>
  meeting: ReflectionGroup_meeting
  reflectionGroup: ReflectionGroup_reflectionGroup
  retroPhaseItemId: string

  setItemRef(c: HTMLElement): void

  setChildRef: (groupId: string, reflectionId: string) => (c: HTMLElement) => void
}

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

interface GroupProps {
  isModal?: boolean | null
  isHidden?: boolean | null
}

const GroupStyle = styled('div')(
  {
    padding: CARD_PADDING,
    position: 'absolute',
    display: 'inline-block',
    // necessary for smooth updating column heights
    transition: 'transform 200ms'
  },
  ({isModal}: GroupProps) =>
    isModal && {
      borderRadius: 6,
      overflow: 'hidden',
      padding: MODAL_PADDING,
      position: 'absolute',
      transition: 'unset',
      zIndex: 100
    },
  ({isHidden}: GroupProps) =>
    isHidden && {
      opacity: 0,
      pointerEvents: 'none'
    }
)

class ReflectionGroup extends Component<Props> {
  isClosing = false
  backgroundRef?: HTMLDivElement | null
  headerRef?: HTMLDivElement | null
  modalRef?: HTMLDivElement | null

  componentDidUpdate(prevProps) {
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
    if (!boundingBox) return
    const {top: collapsedTop, left: collapsedLeft} = boundingBox
    const top = collapsedTop + parentTop - MODAL_PADDING + CARD_PADDING
    const left = collapsedLeft + parentLeft - MODAL_PADDING + CARD_PADDING
    // animate child home
    modalStyle.transition = `all ${childDuration}ms ${MIN_ITEM_DELAY}ms ${STANDARD_CURVE}`
    modalStyle.transform = `translate(${left}px,${top}px)`
    modalStyle.overflow = 'hidden'

    // animate background home
    const childCache = childrenCache[reflectionGroupId]
    const {modalBoundingBox, headerHeight} = childCache
    if (!modalBoundingBox) return
    const {height: modalHeight, width: modalWidth} = modalBoundingBox
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
      if (!childCache.el) return
      childCache.el.style.opacity = ''
      // @ts-ignore
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
    this.modalRef.addEventListener('transitionend', reset)
  }

  renderReflection = (
    reflection: ReflectionGroup_reflectionGroup['reflections'][0],
    idx: number,
    {isModal, isDraggable}
  ) => {
    const {setItemRef, meeting, reflectionGroup} = this.props
    const {reflections} = reflectionGroup
    const {isViewerDragInProgress} = meeting
    return (
      <DraggableReflectionCard
        // @ts-ignore
        closeGroupModal={isModal ? this.closeGroupModal : undefined}
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
      // @ts-ignore
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

  render() {
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
        <GroupStyle
          innerRef={setChildRef(reflectionGroupId, firstReflection.id)}
          isHidden={isExpanded}
        >
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
        </GroupStyle>
        <Modal clickToClose escToClose isOpen={isExpanded} onClose={this.closeGroupModal}>
          <GroupStyle innerRef={this.setModalRef} isModal>
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
          </GroupStyle>
        </Modal>
      </React.Fragment>
    )
  }
}

const reflectionDropSpec = {
  canDrop(props: Props, monitor) {
    return (
      monitor.isOver() &&
      monitor.getItem().reflectionGroupId !== props.reflectionGroup.reflectionGroupId
    )
  },

  drop(props: Props, monitor) {
    if (monitor.didDrop()) return undefined
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
