import React from 'react'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DropTarget} from '@mattkrick/react-dnd'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {REFLECTION_CARD, REFLECTION_GRID, REFLECTION_GROUP} from 'universal/utils/constants'
import type {PhaseItemMasonry_meeting as Meeting} from '__generated__/PhaseItemMasonry_meeting.graphql'
import {css} from 'react-emotion'
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup'
import initializeGrid from 'universal/utils/multiplayerMasonry/initializeGrid'
import updateColumnHeight from 'universal/utils/multiplayerMasonry/updateColumnHeight'
import isTempId from 'universal/utils/relay/isTempId'
import setClosingTransform from 'universal/utils/multiplayerMasonry/setClosingTransform'
import handleDropOnGrid from 'universal/utils/multiplayerMasonry/handleDropOnGrid'
import appTheme from 'universal/styles/theme/appTheme'
import ReflectionCardInFlight from 'universal/components/ReflectionCardInFlight'
import Modal from 'universal/components/Modal'
import {MODAL_PADDING} from 'universal/utils/multiplayerMasonry/masonryConstants'
import withScrolling from 'react-dnd-scrollzone'

type Props = {|
  meeting: Meeting
|}

const gridStyle = css({
  overflowX: 'auto',
  position: 'relative',
  width: '100%'
})

// a reflectionId grid has many reflectionGroups has many reflections (parent > child > item)
export type ItemId = string

// reflectionGroupId
export type ChildId = string

export type InFlightCoords = {
  x: number,
  y: number
}

export type ParentCache = {
  el: ?HTMLElement,
  boundingBox: ?ClientRect,
  columnLefts: Array<number>,
  cardsInFlight: {[ItemId]: InFlightCoords},
  // the location for a group that has not been created yet (caused by an ungrouping)
  incomingChildren: {
    [ItemId]: {
      boundingBox: ?ClientRect,
      // the optimistic child that currently represents the group
      childId: ChildId
    }
  }
}

type ChildCache = {
  // reflection group element
  el: ?HTMLElement,
  // boundingBox coords are relative to the parentCache!
  boundingBox: ?ClientRect
}

type ItemCache = {
  el: ?HTMLElement,
  boundingBox: ?ClientRect
}

export type ChildrenCache = {
  [ChildId]: ChildCache
}

class PhaseItemMasonry extends React.Component<Props> {
  constructor (props) {
    super(props)
    const {atmosphere} = props
    const {eventEmitter} = atmosphere
    eventEmitter.on('endDraggingReflection', this.handleDragEnd)
    //  big ugly hack to provide the children cache to the team subscription updater to handle updateDragLocation
    // the alternative would be to emit an event in the onNext, handle it here, and make a local commit in the handler
    // fps > clean coding practices in this case
    atmosphere.getMasonry = () => ({
      itemCache: this.itemCache,
      childrenCache: this.childrenCache,
      parentCache: this.parentCache
    })
  }

  parentCache: ParentCache = {
    el: null,
    boundingBox: null,
    columnLefts: [],
    cardsInFlight: {},
    incomingChildren: {}
  }

  childrenCache: ChildrenCache = {}
  itemCache: ItemCache = {}

  componentDidMount () {
    const {
      atmosphere: {eventEmitter}
    } = this.props
    initializeGrid(this.itemCache, this.childrenCache, this.parentCache, true)
    window.addEventListener('resize', this.handleResize)
    eventEmitter.on('meetingSidebarCollapsed', this.handleResize)
  }

  componentWillUnmount () {
    const {atmosphere} = this.props
    const {eventEmitter} = atmosphere
    eventEmitter.off('endDraggingReflection', this.handleDragEnd)
    delete atmosphere.getMasonry
    window.removeEventListener('resize', this.handleResize)
    eventEmitter.off('meetingSidebarCollapsed', this.handleResize)
  }

  handleDragEnd = (payload) => {
    const {atmosphere} = this.props
    const {dropTargetType, dropTargetId, childId, itemId, sourceId} = payload
    if (dropTargetType === REFLECTION_GRID) {
      updateColumnHeight(this.childrenCache, sourceId)
      handleDropOnGrid(
        atmosphere,
        this.itemCache,
        this.childrenCache,
        this.parentCache,
        childId,
        itemId
      )
    } else if (dropTargetType === REFLECTION_GROUP) {
      this.handleGridUpdate(sourceId, dropTargetId)
      const {boundingBox, modalEl, el} = this.itemCache[itemId]
      if (modalEl) {
        const {
          modalBoundingBox: {left: modalLeft, top: modalTop},
          headerHeight
        } = this.childrenCache[childId]
        const {left, top} = boundingBox
        setClosingTransform(atmosphere, itemId, {
          x: modalLeft + left + MODAL_PADDING,
          y: modalTop + top + headerHeight + MODAL_PADDING
        })
      } else {
        /*
         * There is a bug in react's vdom where the setRef doesn't get called under certain conditions
         * To reproduce, have 3 cards. A, B, C. A is to the left of B,C which are in a group.
         * Drag B onto A and you have B,A then C all alone.
         * However, the reference to the new B will not be created until after the drop.
         * To mitigate this, we add attach the reflectionId to the DOM node itself so we can find it
         */
        const correctEl = document.contains(el) ? el : document.getElementById(itemId)
        const {top, left} = correctEl.getBoundingClientRect()
        setClosingTransform(atmosphere, itemId, {x: left, y: top})
      }
    } else {
      const cachedItem = this.itemCache[itemId]
      const bestEl = cachedItem.modalEl || cachedItem.el
      const {x, y} = bestEl.getBoundingClientRect()
      setClosingTransform(atmosphere, itemId, {x, y})
    }
    if (atmosphere.startDragQueue && atmosphere.startDragQueue.length) {
      // reply the startDrag event that fired before we received the end drag event
      const queuedStart = atmosphere.startDragQueue.shift()
      queuedStart()
    }
  }

  setInFlightCoords = (x: number, y: number, itemId: ItemId) => {
    // this is called frequently. keep it cheap!
    this.parentCache.cardsInFlight[itemId] = {
      x,
      y
    }
  }

  handleResize = () => {
    initializeGrid(this.itemCache, this.childrenCache, this.parentCache, false)
  }

  handleGridUpdate = (oldReflectionGroupId, newReflectionGroupId) => {
    updateColumnHeight(this.childrenCache, oldReflectionGroupId)
    updateColumnHeight(this.childrenCache, newReflectionGroupId)
  }

  setItemRef = (itemId, isModal) => (c) => {
    if (!c) {
      if (isModal) {
        this.itemCache[itemId].modalEl = undefined
      }
      return
    }
    const elType = isModal ? 'modalEl' : 'el'
    this.itemCache[itemId] = this.itemCache[itemId] || {}
    this.itemCache[itemId][elType] = c
  }

  setChildRef = (childId, itemId) => (c) => {
    if (!c) return
    this.childrenCache[childId] = this.childrenCache[childId] || {}
    const childCache = this.childrenCache[childId]
    const incomingChild = this.parentCache.incomingChildren[itemId]
    if (incomingChild) {
      const {boundingBox, childId: incomingChildId} = incomingChild
      // bounding box may change between optimistic updates
      childCache.boundingBox = incomingChildId
        ? this.childrenCache[incomingChildId].boundingBox
        : boundingBox
      // once we get the final card, it is no long incoming
      if (isTempId(childId)) {
        incomingChild.childId = childId
      } else {
        delete this.parentCache.incomingChildren[itemId]
      }
      delete this.childrenCache[incomingChildId]
      const {
        boundingBox: {left, top}
      } = childCache
      c.style.transform = `translate(${left}px, ${top}px)`
    }
    childCache.el = c
  }

  setParentRef = (c) => {
    this.parentCache.el = c
  }

  render () {
    const {canDrop, connectDropTarget, meeting} = this.props
    const {reflectionGroups, reflectionsInFlight = [], teamId} = meeting
    return connectDropTarget(
      <div
        ref={this.setParentRef}
        className={gridStyle}
        style={{backgroundColor: canDrop && appTheme.palette.light70l}}
      >
        {reflectionGroups.map((reflectionGroup) => {
          const {reflectionGroupId} = reflectionGroup
          return (
            <ReflectionGroup
              key={reflectionGroupId}
              meeting={meeting}
              reflectionGroup={reflectionGroup}
              setChildRef={this.setChildRef}
              setItemRef={this.setItemRef}
              childrenCache={this.childrenCache}
              parentCache={this.parentCache}
              itemCache={this.itemCache}
            />
          )
        })}
        {reflectionsInFlight.map((reflection) => {
          return (
            <Modal key={reflection.id} isOpen>
              <ReflectionCardInFlight
                setInFlightCoords={this.setInFlightCoords}
                reflection={reflection}
                itemCache={this.itemCache}
                childrenCache={this.childrenCache}
                parentCache={this.parentCache}
                teamId={teamId}
              />
            </Modal>
          )
        })}
      </div>
    )
  }
}

const reflectionDropSpec = {
  canDrop (props: Props, monitor) {
    return monitor.isOver({shallow: true}) && !monitor.getItem().isSingleCardGroup
  },
  drop () {
    return {dropTargetType: REFLECTION_GRID}
  }
}

const reflectionDropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: monitor.canDrop()
})

export default createFragmentContainer(
  withScrolling(
    withAtmosphere(
      withMutationProps(
        DropTarget(REFLECTION_CARD, reflectionDropSpec, reflectionDropCollect)(PhaseItemMasonry)
      )
    )
  ),
  graphql`
    fragment PhaseItemMasonry_meeting on RetrospectiveMeeting {
      ...ReflectionGroup_meeting
      meetingId: id
      reflectionGroups {
        ...ReflectionGroup_reflectionGroup
        reflectionGroupId: id
        meetingId
        sortOrder
        retroPhaseItemId
        reflections {
          reflectionId: id
          retroPhaseItemId
          sortOrder
          dragContext {
            dragId: id
          }
        }
      }
      reflectionsInFlight {
        id
        ...ReflectionCardInFlight_reflection
      }
      teamId
    }
  `
)
