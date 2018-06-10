import React from 'react'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DropTarget} from 'react-dnd'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {REFLECTION_CARD} from 'universal/utils/constants'
import type {PhaseItemMasonry_meeting as Meeting} from './__generated__/PhaseItemMasonry_meeting.graphql'
import dndNoise from 'universal/utils/dndNoise'
import UpdateReflectionLocationMutation from 'universal/mutations/UpdateReflectionLocationMutation'
import styled, {css} from 'react-emotion'
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup'
import shakeUpBottomCells from 'universal/utils/multiplayerMasonry/shakeUpBottomCells'
import initializeGrid from 'universal/utils/multiplayerMasonry/initializeGrid'
import handleNewGroup from 'universal/utils/multiplayerMasonry/handleNewGroup'
import updateColumnHeight from 'universal/utils/multiplayerMasonry/updateColumnHeight'
import handleSwappedGroup from 'universal/utils/multiplayerMasonry/handleSwappedGroup'

type Props = {|
  meeting: Meeting
|}

export const CARD_PADDING = 8
const CARD_WIDTH = 320 + CARD_PADDING * 2

const GridStyle = css({
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

type DroppedCardRect = {
  height: number,
  width: number,
  left: number,
  top: number
}

type IncomingChild = {
  childId: ChildId,
  itemId: ItemId
}

type ParentCache = {
  el: ?HTMLElement,
  boundingBox: ?ClientRect,
  columnLefts: Array<number>,
  droppedCards: {[ItemId]: DroppedCardRect},
  incomingChild: ?IncomingChild
}

type ChildCache = {
  el: ?HTMLElement,
  // boundingBox coords are relative to the parentCache!
  boundingBox: ?ClientRect
}
type ChildrenCache = {
  [ChildId]: ChildCache
}

// type PendingNewGroup = {
//   newReflectionGroupId: string,
//   oldReflectionGroupId: string
// }

class PhaseItemMasonry extends React.Component<Props> {
  constructor (props) {
    super(props)
    window.childrenCache = this.childrenCache
    window.parentCache = this.parentCache
    const {
      atmosphere: {eventEmitter}
    } = props
    eventEmitter.on('updateReflectionLocation', this.handleGridUpdate)
  }

  parentCache: ParentCache = {
    el: null,
    boundingBox: null,
    columnLefts: [],
    droppedCards: {},
    incomingChild: null
  }
  childrenCache: ChildrenCache = {}

  componentDidMount () {
    this.parentCache.incomingChild = null
    initializeGrid(this.childrenCache, this.parentCache, CARD_WIDTH)
    window.addEventListener('resize', this.handleResize)
  }

  getSnapshotBeforeUpdate (prevProps) {
    const {
      meeting: {reflectionGroups: oldReflectionGroups}
    } = prevProps
    const {
      meeting: {reflectionGroups}
    } = this.props
    if (oldReflectionGroups.length === reflectionGroups.length) {
      const newGroupSet = new Set(reflectionGroups.map((group) => group.reflectionGroupId))
      const removedReflectionGroup = oldReflectionGroups.find(
        (group) => !newGroupSet.has(group.reflectionGroupId)
      )
      if (removedReflectionGroup) {
        /*
         * if we're swapping out 1 card for another (like a temporary one generated via optmistic UI)
         * it could be swapped out mid-transition
         * to eliminate jitter, put the new card exactly where the old one is
         * so it can continue its journey to its final destination
         */
        //
        // it's a swap!
        const {reflectionGroupId: oldReflectionGroupId} = removedReflectionGroup
        const oldChildCache = this.childrenCache[oldReflectionGroupId]
        const {left, top} = oldChildCache.el.getBoundingClientRect()
        const {
          boundingBox: {top: parentTop, left: parentLeft}
        } = this.parentCache
        return {
          oldReflectionGroupId,
          left: left - parentLeft,
          top: top - parentTop
        }
      }
    }
    return null
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    console.log('cDU')
    if (!this.parentCache.incomingChild) return
    if (snapshot) {
      handleSwappedGroup(this.childrenCache, this.parentCache, snapshot)
      this.parentCache.incomingChild = null
    } else {
      handleNewGroup(this.childrenCache, this.parentCache)
      this.parentCache.incomingChild = null
    }
  }

  setOptimisticRect = (clientRect: ClientRect, itemId: ItemId) => {
    const {height, width, top, left} = clientRect
    const {
      boundingBox: {top: parentTop, left: parentLeft}
    } = this.parentCache
    console.log('setting opt rect')
    this.parentCache.droppedCards[itemId] = {
      height,
      width,
      top: top - parentTop,
      left: left - parentLeft
    }
  }

  handleResize = () => {
    // const gridBox = this.parentCache.el.getBoundingClientRect()
    // const deltaWidth = gridBox - this.parentCache.boundingBox.width
    // if (deltaWidth === 0) return
    // const columnCount = Math.floor(gridBox.width / CARD_WIDTH)
    // const leftMargin = (gridBox.width - columnCount * CARD_WIDTH) / 2
    // TODO we may store the top of each card in a matrix, and that'll determine how we proceed here
  }

  handleGridUpdate = (payload) => {
    const {
      oldReflectionGroup: {id: oldReflectionGroupId},
      reflectionGroup: {id: newReflectionGroupId}
    } = payload

    console.log('handle grid update', newReflectionGroupId)
    const newChildCache = this.childrenCache[newReflectionGroupId]
    // if this doesn't exist, it means the updateReflectionLocation event fired before react was told to add a component (optimistic)
    // if it exists and the boundingBox is undefined, then the element is created, but we don't know where to put it
    //
    if (!newChildCache) {
      console.log('no new cache yet, setting outgoingId')
      this.parentCache.outgoingId = oldReflectionGroupId
    } else if (!newChildCache.boundingBox) {
      console.log('no bounding box found! did this fire before cDU?')
    }

    // this.childrenCache[oldReflectionGroupId].el.offsetTop // TRIGGER LAYOUT
    updateColumnHeight(this.childrenCache, oldReflectionGroupId)
    if (oldReflectionGroupId !== newReflectionGroupId) {
      updateColumnHeight(this.childrenCache, newReflectionGroupId)
    }
    shakeUpBottomCells(this.childrenCache, this.parentCache.columnLefts)
  }

  setChildRef = (childId, itemId) => (c) => {
    if (c) {
      if (!this.childrenCache[childId]) {
        console.log('setting child cache', childId)
        if (childId === 'el') {
        }
        this.childrenCache[childId] = {el: c}
        this.parentCache.incomingChild = {
          childId,
          itemId
        }
      }
    }
  }

  setParentRef = (c) => {
    this.parentCache.el = c
  }

  render () {
    const {connectDropTarget, meeting} = this.props
    const {reflectionGroups} = meeting
    return connectDropTarget(
      <div ref={this.setParentRef} className={GridStyle}>
        {reflectionGroups.map((reflectionGroup, idx) => {
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
                setOptimisticRect={this.setOptimisticRect}
                idx={idx}
              />
            </CardWrapper>
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
  drop (props: Props, monitor) {
    const {
      meeting: {reflectionGroups}
    } = props
    const sortOrder = reflectionGroups[reflectionGroups.length - 1].sortOrder + 1 + dndNoise()

    const {reflectionId, reflectionGroupId, isSingleCardGroup} = monitor.getItem()
    const {
      atmosphere,
      submitMutation,
      meeting: {meetingId},
      onError,
      onCompleted
    } = props

    const variables = {
      reflectionId: isSingleCardGroup ? null : reflectionId,
      reflectionGroupId: isSingleCardGroup ? reflectionGroupId : null,
      sortOrder
    }
    submitMutation()
    UpdateReflectionLocationMutation(atmosphere, variables, {meetingId}, onError, onCompleted)
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
    }
  `
)
