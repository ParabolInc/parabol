import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DropTarget} from 'react-dnd'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {REFLECTION_CARD, REFLECTION_GRID, REFLECTION_GROUP} from 'universal/utils/constants'
import type {PhaseItemMasonry_meeting as Meeting} from './__generated__/PhaseItemMasonry_meeting.graphql'
import dndNoise from 'universal/utils/dndNoise'
import UpdateReflectionLocationMutation from 'universal/mutations/UpdateReflectionLocationMutation'
import styled, {css} from 'react-emotion'
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup'
import shakeUpBottomCells from 'universal/utils/multiplayerMasonry/shakeUpBottomCells'
import initializeGrid from 'universal/utils/multiplayerMasonry/initializeGrid'
import updateColumnHeight from 'universal/utils/multiplayerMasonry/updateColumnHeight'
import getLastCardPerColumn from 'universal/utils/multiplayerMasonry/getLastCardPerColumn'
import isTempId from 'universal/utils/relay/isTempId'

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

type InFlightCoords = {
  x: number,
  y: number
}

type IncomingChild = {
  childId: ChildId,
  itemId: ItemId
}

type ParentCache = {
  el: ?HTMLElement,
  boundingBox: ?ClientRect,
  columnLefts: Array<number>,
  cardsInFlight: {[ItemId]: InFlightCoords},
  incomingChild: ?IncomingChild
}

type ChildCache = {
  el: ?HTMLElement,
  // boundingBox coords are relative to the parentCache!
  boundingBox: ?ClientRect,
  inFlightCoords: InFlightCoords
}
type ChildrenCache = {
  [ChildId]: ChildCache
}

const setClosingTransform = (atmosphere, itemId, left, top) => {
  commitLocalUpdate(atmosphere, (store) => {
    const reflection = store.get(itemId)
    reflection
      .getLinkedRecord('dragContext')
      .setValue(`translate(${left}px, ${top}px)`, 'closingTransform')
  })
}

class PhaseItemMasonry extends React.Component<Props> {
  constructor (props) {
    super(props)
    window.childrenCache = this.childrenCache
    window.parentCache = this.parentCache
    const {
      atmosphere: {eventEmitter}
    } = props
    eventEmitter.on('updateReflectionLocation', this.handleGridUpdate)
    eventEmitter.on('dragReflection', this.handleDragEnd)
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
    initializeGrid(this.childrenCache, this.parentCache, CARD_WIDTH)
    window.addEventListener('resize', this.handleResize)
  }

  // getSnapshotBeforeUpdate (prevProps) {
  //   const {
  //     meeting: {reflectionGroups: oldReflectionGroups}
  //   } = prevProps
  //   const {
  //     meeting: {reflectionGroups}
  //   } = this.props
  //   if (oldReflectionGroups.length === reflectionGroups.length) {
  //     const newGroupSet = new Set(reflectionGroups.map((group) => group.reflectionGroupId))
  //     const removedReflectionGroup = oldReflectionGroups.find(
  //       (group) => !newGroupSet.has(group.reflectionGroupId)
  //     )
  //     if (removedReflectionGroup) {
  //       /*
  //        * if we're swapping out 1 card for another (like a temporary one generated via optmistic UI)
  //        * it could be swapped out mid-transition
  //        * to eliminate jitter, put the new card exactly where the old one is
  //        * so it can continue its journey to its final destination
  //        */
  //       //
  //       // it's a swap!
  //       const {reflectionGroupId: oldReflectionGroupId} = removedReflectionGroup
  //       const oldChildCache = this.childrenCache[oldReflectionGroupId]
  //       const {left, top} = oldChildCache.el.getBoundingClientRect()
  //       const {
  //         boundingBox: {top: parentTop, left: parentLeft}
  //       } = this.parentCache
  //       return {
  //         oldReflectionGroupId,
  //         left: left - parentLeft,
  //         top: top - parentTop
  //       }
  //     }
  //   }
  //   return null
  // }
  //
  // componentDidUpdate (prevProps, prevState, snapshot) {
  //   console.log('cDU')
  //   const {incomingChild} = this.parentCache
  //   if (snapshot) {
  //     handleSwappedGroup(this.childrenCache, this.parentCache, snapshot)
  //     this.parentCache.incomingChild = null
  //   } else if (incomingChild) {
  //     setIncomingAtInFlightLocation(this.childrenCache, this.parentCache)
  //     this.parentCache.incomingChild = null
  //   }
  // }

  componentWillUnmount () {
    const {
      atmosphere: {eventEmitter}
    } = this.props
    eventEmitter.off('updateReflectionLocation', this.handleGridUpdate)
    eventEmitter.off('dragReflection', this.handleDragEnd)
  }

  handleDragEnd = (payload) => {
    console.log('handling drag reflection')
    const {atmosphere} = this.props
    const {dropTargetType, dropTargetId, childId, itemId} = payload
    const childCache = this.childrenCache[childId]
    switch (dropTargetType) {
      case null:
        const {left, top} = childCache.itemEl.getBoundingClientRect()
        setClosingTransform(atmosphere, itemId, left, top)
        break
      case REFLECTION_GRID:
        console.log('DROP ON GRID')
        const {
          boundingBox: {top: parentTop, left: parentLeft},
          cardsInFlight,
          columnLefts,
          incomingChildren
        } = this.parentCache
        const {x: dropX, y: dropY} = cardsInFlight[itemId]
        const droppedLeft = dropX - parentLeft
        const droppedTop = dropY - parentTop
        const lastCardPerColumn = getLastCardPerColumn(this.childrenCache, columnLefts)

        const bottomCoords = columnLefts.map((left) => {
          const bottomCard = lastCardPerColumn[left]
          const top = bottomCard ? bottomCard.boundingBox.top + bottomCard.boundingBox.height : 0
          return {left, top}
        })

        const distances = bottomCoords.map(
          ({left, top}) => Math.abs(left - droppedLeft) + Math.abs(top - droppedTop)
        )
        const minDistanceIdx = distances.indexOf(Math.min(...distances))
        const {left: newLeft, top: newTop} = bottomCoords[minDistanceIdx]
        const {height} = childCache.itemEl.getBoundingClientRect()
        setClosingTransform(
          atmosphere,
          itemId,
          newLeft + parentLeft + CARD_PADDING,
          newTop + parentTop + CARD_PADDING
        )
        incomingChildren[itemId] = {
          boundingBox: {
            left: newLeft,
            top: newTop,
            width: CARD_WIDTH,
            height: height + 2 * CARD_PADDING
          },
          childId: null
        }
        break
      case REFLECTION_GROUP:
        console.log('MOVING TO GROUP', itemId, dropTargetId)
        const {itemEl: targetEl} = this.childrenCache[dropTargetId]
        // sometimes we can catch react in mid-render before the itemEl was updated
        // if that happens, itemEl will be detached from the DOM & the bbox will be 0s
        // an async alternative would be to wait a tick & try again
        const {left: targetLeft, top: targetTop} = targetEl.getBoundingClientRect()
        setClosingTransform(atmosphere, itemId, targetLeft, targetTop)
        break
      default:
        throw new Error('Unhandled drop', dropTargetType)
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
    if (!newChildCache) {
      console.log('no new cache yet, setting outgoingId')
    }

    // this.childrenCache[oldReflectionGroupId].el.offsetTop // TRIGGER LAYOUT
    updateColumnHeight(this.childrenCache, oldReflectionGroupId)
    if (oldReflectionGroupId !== newReflectionGroupId) {
      // this.childrenCache[newReflectionGroupId].el.offsetTop // TRIGGER LAYOUT
      updateColumnHeight(this.childrenCache, newReflectionGroupId)
    }
    shakeUpBottomCells(this.childrenCache, this.parentCache.columnLefts)

    // TODO gracefully drop cards on the stack
    const {
      meeting: {reflectionGroups}
    } = this.props
    const reflectionGroup = reflectionGroups.find(
      (group) => group.reflectionGroupId === newReflectionGroupId
    )
    const [reflection] = reflectionGroup.reflections
    // const droppedCard = this.parentCache.cardsInFlight[reflection.reflectionId]
    // if (droppedCard) {
    //   const {boundingBox: {left: parentLeft, top: parentTop}} = this.parentCache
    //   const left = droppedCard.x - parentLeft
    //   const top = droppedCard.y - parentTop
    //   droppedCard.el.style.transform = `translate(${left}px,${top}px)`
    // }
    // console.log('thing to delete', )
    delete this.parentCache.cardsInFlight[reflection.reflectionId]
  }

  setItemRef = (childId) => (c) => {
    if (c) {
      if (!this.childrenCache[childId]) {
        this.childrenCache[childId] = {itemEl: c}
      } else {
        this.childrenCache[childId].itemEl = c
      }
    }
  }

  setChildRef = (childId, itemId) => (c) => {
    if (!c) return
    const childCache = this.childrenCache[childId]
    if (!childCache.el && !childCache.boundingBox) {
      const incomingChild = this.parentCache.incomingChildren[itemId]
      if (incomingChild) {
        const {boundingBox} = incomingChild
        if (incomingChild.childId) {
          // swap the coords with the previous placeholder
          childCache.boundingBox = this.childrenCache[incomingChild.childId].boundingBox
          delete this.childrenCache[incomingChild.childId]
        } else {
          // grab the coords from the incoming child
          childCache.boundingBox = boundingBox
          incomingChild.boundingBox = undefined
        }
        // not a huge mem leak since it can only grow to the size of reflections, but nice to keep clean
        if (isTempId(childId)) {
          incomingChild.childId = childId
        } else {
          delete this.parentCache.incomingChildren[itemId]
        }
        c.style.transform = `translate(${childCache.boundingBox.left}px, ${
          childCache.boundingBox.top
        }px)`
      }
    }
    childCache.el = c
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
          const childCache = this.childrenCache[reflectionGroupId]
          if (childCache && !childCache.boundingBox) return null
          return (
            <CardWrapper
              innerRef={this.setChildRef(reflectionGroupId, reflectionId)}
              key={reflectionGroupId}
            >
              <ReflectionGroup
                meeting={meeting}
                reflectionGroup={reflectionGroup}
                setInFlightCoords={this.setInFlightCoords}
                setItemRef={this.setItemRef(reflectionGroupId)}
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
    const updateLocation = () => {
      UpdateReflectionLocationMutation(atmosphere, variables, {meetingId}, onError, onCompleted)
    }
    return {dropTargetType: REFLECTION_GRID, updateLocation}
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
