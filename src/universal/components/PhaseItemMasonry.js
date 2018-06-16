import React from 'react'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DropTarget} from '@mattkrick/react-dnd'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {REFLECTION_CARD, REFLECTION_GRID, REFLECTION_GROUP} from 'universal/utils/constants'
import type {PhaseItemMasonry_meeting as Meeting} from './__generated__/PhaseItemMasonry_meeting.graphql'
import styled, {css} from 'react-emotion'
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup'
import shakeUpBottomCells from 'universal/utils/multiplayerMasonry/shakeUpBottomCells'
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

export const CARD_PADDING = 8
export const REFLECTION_WIDTH = 320 + CARD_PADDING * 2

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
  // first reflection element
  itemEl: ?HTMLElement,
  // boundingBox coords are relative to the parentCache!
  boundingBox: ?ClientRect
}

type ChildrenCache = {
  [ChildId]: ChildCache
}

class PhaseItemMasonry extends React.Component<Props> {
  constructor (props) {
    super(props)
    const {
      atmosphere: {eventEmitter}
    } = props
    eventEmitter.on('endDraggingReflection', this.handleDragEnd)
  }

  parentCache: ParentCache = {
    el: null,
    boundingBox: null,
    columnLefts: [],
    cardsInFlight: {},
    incomingChildren: {}
  }

  childrenCache: ChildrenCache = {}

  componentDidMount () {
    initializeGrid(this.childrenCache, this.parentCache, true)
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount () {
    const {
      atmosphere: {eventEmitter}
    } = this.props
    eventEmitter.off('endDraggingReflection', this.handleDragEnd)
    window.removeEventListener('resize', this.handleResize)
  }

  handleDragEnd = (payload) => {
    const {atmosphere} = this.props
    const {dropTargetType, dropTargetId, childId, itemId, sourceId} = payload
    if (dropTargetType === REFLECTION_GRID) {
      updateColumnHeight(this.childrenCache, sourceId)
      handleDropOnGrid(atmosphere, this.childrenCache, this.parentCache, childId, itemId)
    } else if (dropTargetType === REFLECTION_GROUP) {
      const {itemEl: targetEl} = this.childrenCache[dropTargetId]
      const targetAdjustment = this.handleGridUpdate(sourceId, dropTargetId)
      const {x, y} = targetEl.getBoundingClientRect()
      setClosingTransform(atmosphere, itemId, {x, y: y + targetAdjustment})
    } else {
      console.log('setting close transform')
      const sourceChildCache = this.childrenCache[sourceId]
      const {x, y} = sourceChildCache.itemEl.getBoundingClientRect()
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

  setItemRef = (childId) => (c) => {
    if (!c) return
    this.childrenCache[childId] = this.childrenCache[childId] || {}
    this.childrenCache[childId].itemEl = c
  }

  setChildRef = (childId, itemId) => (c) => {
    if (!c) return
    const childCache = this.childrenCache[childId]
    const incomingChild = this.parentCache.incomingChildren[itemId]
    if (incomingChild) {
      const {boundingBox, childId: incomingChildId} = incomingChild
      // bounding box may change between optimistic updates
      childCache.boundingBox = incomingChildId
        ? this.childrenCache[incomingChild.childId].boundingBox
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
          const {reflectionGroupId, reflections} = reflectionGroup
          const [firstReflection] = reflections
          const reflectionId = firstReflection ? firstReflection.reflectionId : ''
          return (
            <CardWrapper
              innerRef={this.setChildRef(reflectionGroupId, reflectionId)}
              key={reflectionGroupId}
            >
              <ReflectionGroup
                meeting={meeting}
                reflectionGroup={reflectionGroup}
                setItemRef={this.setItemRef(reflectionGroupId)}
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
                shakeUpBottom={() =>
                  shakeUpBottomCells(this.childrenCache, this.parentCache.columnLefts)
                }
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
