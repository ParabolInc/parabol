import {PhaseItemMasonry_meeting} from '__generated__/PhaseItemMasonry_meeting.graphql'
import React from 'react'
import {
  ConnectDropTarget,
  DropTarget,
  DropTargetCollector,
  DropTargetConnector,
  DropTargetMonitor,
  DropTargetSpec
} from 'react-dnd'
import withScrolling from 'react-dnd-scrollzone'
import {css} from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {BBox, Coords} from 'types/animations'
import Modal from 'universal/components/Modal'
import ReflectionCardInFlight from 'universal/components/ReflectionCardInFlight'
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup'
import getBBox from 'universal/components/RetroReflectPhase/getBBox'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import appTheme from 'universal/styles/theme/appTheme'
import {REFLECTION_CARD} from 'universal/utils/constants'
import handleDropOnGrid from 'universal/utils/multiplayerMasonry/handleDropOnGrid'
import initializeGrid from 'universal/utils/multiplayerMasonry/initializeGrid'
import {MODAL_PADDING} from 'universal/utils/multiplayerMasonry/masonryConstants'
import setClosingTransform from 'universal/utils/multiplayerMasonry/setClosingTransform'
import updateColumnHeight from 'universal/utils/multiplayerMasonry/updateColumnHeight'
import isTempId from 'universal/utils/relay/isTempId'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {DragReflectionDropTargetTypeEnum} from 'universal/types/graphql'
import Atmosphere from '../Atmosphere'

interface CollectedProps {
  connectDropTarget: ConnectDropTarget
  canDrop: boolean
}

interface PassedProps {
  meeting: PhaseItemMasonry_meeting
}

interface Props extends WithAtmosphereProps, WithMutationProps, CollectedProps, PassedProps {
  atmosphere: MasonryAtmosphere
}

const gridStyle = css({
  overflowX: 'auto',
  position: 'relative',
  width: '100%'
})

interface ItemCache {
  el?: HTMLElement | undefined
  boundingBox?: BBox | null
  modalEl: HTMLElement | undefined
}

export interface MasonryItemCache {
  [itemId: string]: ItemCache
}

export interface MasonryAtmosphere extends Atmosphere {
  getMasonry: () => {
    itemCache: MasonryItemCache
    childrenCache: MasonryChildrenCache
    parentCache: MasonryParentCache
  }
  startDragQueue: Array<() => void>
}

interface StaticWidthBBox {
  top: number
  left: number
  height: number
}

interface ChildCache {
  // reflection group element
  el: HTMLElement | null
  // boundingBox coords are relative to the parentCache!
  boundingBox: StaticWidthBBox | null
  modalBoundingBox?: BBox
  headerHeight?: number
}

export interface MasonryChildrenCache {
  [childId: string]: ChildCache
}

export interface MasonryParentCache {
  el: HTMLElement | null
  boundingBox: BBox | null
  columnLefts: Array<number>
  cardsInFlight: {[itemId: string]: Coords}
  // the location for a group that has not been created yet (caused by an ungrouping)
  incomingChildren: {
    [itemId: string]: {
      boundingBox: StaticWidthBBox | null
      // the optimistic child that currently represents the group
      childId: string
    }
  }
}

export type SetItemRef = (itemId: string, isModal?: boolean) => (c: HTMLDivElement) => void
export type SetChildRef = (groupId: string, reflectionId: string) => (c: HTMLElement) => void
export type SetInFlightCoords = (x: number, y: number, itemId: string) => void

interface DropOnGridPayload {
  dropTargetType: DragReflectionDropTargetTypeEnum.REFLECTION_GRID
  childId: string
  itemId: string
  sourceId: string
}

interface DropOnGroupPayload {
  dropTargetType: DragReflectionDropTargetTypeEnum.REFLECTION_GROUP
  dropTargetId: string
  childId: string
  itemId: string
  sourceId: string
}

interface CancelDropPayload {
  dropTargetType: null
  itemId: string
}

export type MasonryDragEndPayload = DropOnGridPayload | DropOnGroupPayload | CancelDropPayload

class PhaseItemMasonry extends React.Component<Props> {
  constructor (props: Props) {
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

  parentCache: MasonryParentCache = {
    el: null,
    boundingBox: null,
    columnLefts: [],
    cardsInFlight: {},
    incomingChildren: {}
  }

  childrenCache: MasonryChildrenCache = {}
  itemCache: MasonryItemCache = {}

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

  handleDragEnd = (payload: MasonryDragEndPayload) => {
    const {atmosphere} = this.props
    // const {dropTargetType, dropTargetId, childId, itemId, sourceId} = payload
    switch (payload.dropTargetType) {
      case DragReflectionDropTargetTypeEnum.REFLECTION_GRID:
        updateColumnHeight(this.childrenCache, payload.sourceId)
        handleDropOnGrid(
          atmosphere,
          this.itemCache,
          this.childrenCache,
          this.parentCache,
          payload.childId,
          payload.itemId
        )
        break
      case DragReflectionDropTargetTypeEnum.REFLECTION_GROUP:
        const {dropTargetId, sourceId, itemId, childId} = payload
        this.handleGridUpdate(sourceId, dropTargetId)
        const {boundingBox, modalEl, el} = this.itemCache[itemId]
        if (modalEl) {
          const {modalBoundingBox, headerHeight = 0} = this.childrenCache[childId]
          if (!modalBoundingBox || !boundingBox) return
          const {left: modalLeft, top: modalTop} = modalBoundingBox
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
          if (!el) return
          const correctEl = document.contains(el) ? el : document.getElementById(itemId)
          if (!correctEl) return
          const bbox = getBBox(correctEl)
          if (!bbox) return
          setClosingTransform(atmosphere, itemId, {x: bbox.left, y: bbox.top})
        }
        break
      default:
        const cachedItem = this.itemCache[payload.itemId]
        const bestEl = cachedItem.modalEl || cachedItem.el
        if (!bestEl) return
        const bbox = getBBox(bestEl)
        if (!bbox) return
        setClosingTransform(atmosphere, payload.itemId, {x: bbox.left, y: bbox.top})
    }
    if (atmosphere.startDragQueue && atmosphere.startDragQueue.length) {
      // reply the startDrag event that fired before we received the end drag event
      const queuedStart = atmosphere.startDragQueue.shift()!
      queuedStart()
    }
  }

  setInFlightCoords: SetInFlightCoords = (x, y, itemId) => {
    // this is called frequently. keep it cheap!
    this.parentCache.cardsInFlight[itemId] = {
      x,
      y
    }
  }

  handleResize = () => {
    initializeGrid(this.itemCache, this.childrenCache, this.parentCache, false)
  }

  handleGridUpdate = (oldReflectionGroupId: string, newReflectionGroupId: string) => {
    updateColumnHeight(this.childrenCache, oldReflectionGroupId)
    updateColumnHeight(this.childrenCache, newReflectionGroupId)
  }

  setItemRef: SetItemRef = (itemId, isModal) => (c) => {
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

  setChildRef: SetChildRef = (childId, itemId) => (c) => {
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
      if (!childCache.boundingBox) return
      const {left, top} = childCache.boundingBox
      c.style.transform = `translate(${left}px, ${top}px)`
    }
    childCache.el = c
  }

  setParentRef = (c: HTMLDivElement) => {
    this.parentCache.el = c
  }

  render () {
    const {canDrop, connectDropTarget, meeting} = this.props
    const {reflectionGroups, teamId} = meeting
    const reflectionsInFlight = meeting.reflectionsInFlight || []
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

const reflectionDropSpec: DropTargetSpec<Props> = {
  canDrop (_props, monitor) {
    return monitor.isOver({shallow: true}) && !monitor.getItem().isSingleCardGroup
  },
  drop () {
    return {dropTargetType: DragReflectionDropTargetTypeEnum.REFLECTION_GRID}
  }
}

const reflectionDropCollect: DropTargetCollector<CollectedProps> = (
  connect: DropTargetConnector,
  monitor: DropTargetMonitor
) => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: monitor.canDrop()
})

export default createFragmentContainer<PassedProps>(
  withScrolling(
    withAtmosphere(
      withMutationProps(
        DropTarget<Props, CollectedProps>(
          REFLECTION_CARD,
          reflectionDropSpec,
          reflectionDropCollect
        )(PhaseItemMasonry)
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
