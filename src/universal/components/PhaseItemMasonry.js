import React from 'react'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DropTarget} from '@mattkrick/react-dnd'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {REFLECTION_CARD, REFLECTION_GRID, REFLECTION_GROUP} from 'universal/utils/constants'
import type {PhaseItemMasonry_meeting as Meeting} from './__generated__/PhaseItemMasonry_meeting.graphql'
import styled, {css} from 'react-emotion'
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup'
import initializeGrid from 'universal/utils/multiplayerMasonry/initializeGrid'
import updateColumnHeight from 'universal/utils/multiplayerMasonry/updateColumnHeight'
import isTempId from 'universal/utils/relay/isTempId'
import setClosingTransform from 'universal/utils/multiplayerMasonry/setClosingTransform'
import handleDropOnGrid from 'universal/utils/multiplayerMasonry/handleDropOnGrid'
import appTheme from 'universal/styles/theme/appTheme'
import ReflectionCardInFlight from 'universal/components/ReflectionCardInFlight'
import Modal from 'universal/components/Modal'

type Props = {|
  meeting: Meeting
|}

const gridStyle = css({
  overflow: 'auto',
  position: 'relative',
  width: '100%'
})

const CardWrapper = styled('div')({
  position: 'absolute',
  display: 'inline-block',
  transition: 'all 200ms'
})

// a reflectionId grid has many reflectionGroups has many reflections (parent > child > item)
type ItemId = string

// reflectionGroupId
type ChildId = string

type InFlightCoords = {
  x: number,
  y: number
}

type ParentCache = {
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

type ChildrenCache = {
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
    initializeGrid(this.childrenCache, this.parentCache, true)
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount () {
    const {atmosphere} = this.props
    const {eventEmitter} = atmosphere
    eventEmitter.off('endDraggingReflection', this.handleDragEnd)
    delete atmosphere.getMasonry
    window.removeEventListener('resize', this.handleResize)
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
      const targetAdjustment = this.handleGridUpdate(sourceId, dropTargetId)
      const {top, left} = this.itemCache[itemId].el.getBoundingClientRect()
      setClosingTransform(atmosphere, itemId, {x: left, y: top + targetAdjustment})
    } else {
      const {x, y} = this.itemCache[itemId].el.getBoundingClientRect()
      setClosingTransform(atmosphere, itemId, {x, y})
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
    initializeGrid(this.childrenCache, this.parentCache, false)
  }

  handleGridUpdate = (oldReflectionGroupId, newReflectionGroupId) => {
    const startingHeight = this.childrenCache[newReflectionGroupId].boundingBox.top
    updateColumnHeight(this.childrenCache, oldReflectionGroupId)
    updateColumnHeight(this.childrenCache, newReflectionGroupId)
    const endingHeight = this.childrenCache[newReflectionGroupId].boundingBox.top
    return endingHeight - startingHeight
  }

  setItemRef = (itemId) => (c) => {
    if (!c) return
    this.itemCache[itemId] = this.itemCache[itemId] || {}
    this.itemCache[itemId].el = c
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
    const {reflectionGroups, reflectionsInFlight = []} = meeting
    return connectDropTarget(
      <div
        ref={this.setParentRef}
        className={gridStyle}
        style={{backgroundColor: canDrop && appTheme.palette.light70l}}
      >
        {reflectionGroups.map((reflectionGroup) => {
          const {reflectionGroupId} = reflectionGroup
          return (
            <CardWrapper key={reflectionGroupId}>
              <ReflectionGroup
                meeting={meeting}
                reflectionGroup={reflectionGroup}
                setChildRef={this.setChildRef}
                setItemRef={this.setItemRef}
                childrenCache={this.childrenCache}
                parentCache={this.parentCache}
                itemCache={this.itemCache}
              />
            </CardWrapper>
          )
        })}
        {reflectionsInFlight.map((reflection) => {
          return (
            <Modal key={reflection.id} isOpen>
              <ReflectionCardInFlight
                cardsInFlight={this.parentCache.cardsInFlight}
                setInFlightCoords={this.setInFlightCoords}
                reflection={reflection}
                itemCache={this.itemCache}
                childrenCache={this.childrenCache}
                parentCache={this.parentCache}
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
  withAtmosphere(
    withMutationProps(
      DropTarget(REFLECTION_CARD, reflectionDropSpec, reflectionDropCollect)(PhaseItemMasonry)
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
        }
      }
      reflectionsInFlight {
        id
        ...ReflectionCardInFlight_reflection
      }
    }
  `
)
