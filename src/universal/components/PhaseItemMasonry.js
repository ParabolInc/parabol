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

type Props = {|
  meeting: Meeting
|}

export const CARD_PADDING = 8
const CARD_WIDTH = 320 + CARD_PADDING * 2
// const MIN_CARD_HEIGHT = 48
export const GRID_ROW_HEIGHT = 8

const GridStyle = css({
  overflow: 'auto',
  position: 'relative',
  width: '100%'
})

const CardWrapper = styled('div')(({height}) => ({
  position: 'absolute',
  display: 'inline-block',
  transition: 'all 200ms'
}))

type ParentCache = {
  el?: HTMLElement,
  boundingBox?: ClientRect,
  columnLefts?: Array<number>
}

type ChildCache = {
  el: ?HTMLElement,
  boundingBox: ?ClientRect
}
type ChildrenCache = {
  [string]: ChildCache
}

// type PendingNewGroup = {
//   newReflectionGroupId: string,
//   oldReflectionGroupId: string
// }

type OptimisticRect = {
  height: number,
  width: number,
  left: number,
  top: number
}

class PhaseItemMasonry extends React.Component<Props> {
  // static getDerivedStateFromProps (nextProps: Props, prevState: State): $Shape<State> | null {
  // }
  constructor (props) {
    super(props)
    window.childrenCache = this.childrenCache
    const {
      atmosphere: {eventEmitter}
    } = props
    eventEmitter.on('updateReflectionLocation', this.handleGridUpdate)
  }

  parentCache: ParentCache = {}
  childrenCache: ChildrenCache = {}
  droppedCardRect: OptimisticRect = undefined

  componentDidMount () {
    this.initializeGrid()
    this.parentCache.incomingId = undefined
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
    const {
      meeting: {reflectionGroups: oldReflectionGroups}
    } = prevProps
    const {
      meeting: {reflectionGroups}
    } = this.props
    if (!this.parentCache.incomingId) return
    if (snapshot) {
      this.handleSwappedGroup(snapshot)
    } else if (oldReflectionGroups.length + 1 === reflectionGroups.length) {
      // TODO could simplify by reading incomingId
      this.handleNewGroup()
    }
    this.parentCache.incomingId = undefined
  }

  handleNewGroup = () => {
    const {incomingId} = this.parentCache
    // const optimisticGroup = this.optimisticQueue.shift()
    // const {incomingId} = optimisticGroup
    const childCache = this.childrenCache[incomingId]
    let top
    let left
    if (this.droppedCardRect) {
      const {top: initialTop, left: initialLeft, width, height} = this.droppedCardRect
      const {columnLefts} = this.parentCache
      const distances = columnLefts.map((col) => Math.abs(col - initialLeft))
      const nearestColIdx = distances.indexOf(Math.min(...distances))
      left = columnLefts[nearestColIdx]
      top = this.getColumnBottom(left, incomingId)
      // TODO moved to position: fixed or adjust translation inside parent to avoid clipping (drag card is in a modal, is never clipped)
      childCache.el.style.transform = `translate(${initialLeft}px, ${initialTop}px)`
      childCache.boundingBox = {top, left, width, height}
    } else {
      console.log('from the servah')
      // TODO next piece
      // const oldChildCache = this.childrenCache[oldReflectionGroupId]
      // const {boundingBox: {left: newLeft, top: newTop}} = oldChildCache
    }
    this.droppedCardRect = undefined

    if (childCache.el.parentElement) {
      // TRIGGER LAYOUT
      childCache.el.offsetTop // eslint-disable-line
      childCache.el.style.transform = `translate(${left}px, ${top}px)`
      this.shakeUpBottomCells()
    }
  }

  handleSwappedGroup = (snapshot) => {
    const {oldReflectionGroupId, left: initialLeft, top: initialTop} = snapshot
    const {incomingId} = this.parentCache
    const oldChildCache = this.childrenCache[oldReflectionGroupId]
    const newChildCache = this.childrenCache[incomingId]
    newChildCache.boundingBox = oldChildCache.boundingBox
    newChildCache.el.style.transform = `translate(${initialLeft}px, ${initialTop}px)`
    delete this.childrenCache[oldReflectionGroupId]
    const {
      boundingBox: {left, top}
    } = newChildCache
    // TRIGGER LAYOUT, definitely necessary
    newChildCache.el.offsetTop // eslint-disable-line
    newChildCache.el.style.transform = `translate(${left}px, ${top}px)`
  }

  getColumnBottom (columnLeft, excludeId) {
    return Object.keys(this.childrenCache)
      .filter((childKey) => childKey !== excludeId)
      .reduce((columnBottom, childKey) => {
        if (!this.childrenCache[childKey].boundingBox) {
          // debugger
        }
        const {
          boundingBox: {left, top, height}
        } = this.childrenCache[childKey]
        return left === columnLeft && top + height > columnBottom ? top + height : columnBottom
      }, 0)
  }

  // handleNewGroup() {
  //   const pendingNewGroup = this.optimisticQueue.shift()
  //   const {newReflectionGroupId, oldReflectionGroupId, el} = pendingNewGroup
  //   const childCache = this.childrenCache[newReflectionGroupId] = this.childrenCache[newReflectionGroupId] || {el}
  //   console.log('handleNewGroup called', newReflectionGroupId)
  //   const isOptimistic = isTempId(newReflectionGroupId)
  //   // if created locally, create the bounding box at the point of the drop
  //   let targetLeft
  //   if (isOptimistic) {
  //     const {top, left, width, height} = this.droppedCardRect
  //     childCache.boundingBox = {top, left, width, height}
  //     childCache.el.style.transform = `translate(${left}px, ${top}px)`
  //     // get new column
  //     const columns = Array.from(new Set(
  //       Object.keys(this.childrenCache)
  //         .filter((childKey) => childKey !== newReflectionGroupId)
  //         .map((childKey) => this.childrenCache[childKey].boundingBox.left)
  //     ))
  //     const distances = columns.map((col) => Math.abs(col - left))
  //     const nearestColIdx = distances.indexOf(Math.min(...distances))
  //     targetLeft = columns[nearestColIdx]
  //   } else {
  //     const {width: newWidth, height: newHeight} = childCache.el.getBoundingClientRect()
  //     // if there is no previous drop (ie it was remote) start at its old group
  //     const oldChildCache = this.childrenCache[oldReflectionGroupId]
  //     const {boundingBox: {left: newLeft, top: newTop}} = oldChildCache
  //     childCache.boundingBox = {
  //       left: newLeft,
  //       top: newTop,
  //       width: newWidth,
  //       height: newHeight
  //     }
  //     targetLeft = newLeft
  //   }
  //
  //
  //   childCache.boundingBox.top = targetColumnHeight
  //   childCache.boundingBox.left = targetLeft
  //   window.requestAnimationFrame(() => {
  //     console.log('handleNewGroup RAF called', newReflectionGroupId)
  //     childCache.el.style.transform = `translate(${targetLeft}px, ${targetColumnHeight}px)`
  //     if (childCache.el.parentElement) {
  //       this.shakeUpBottomCells()
  //     }
  //     // this.sortForMasonry()
  //   })
  // }

  setOptimisticRect (clientRect) {
    const {height, width, top, left} = clientRect
    const {
      boundingBox: {top: parentTop, left: parentLeft}
    } = this.parentCache
    this.droppedCardRect = {
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

  initializeGrid = () => {
    const gridBox = this.parentCache.el.getBoundingClientRect()
    const childrenKeys = Object.keys(this.childrenCache)
    const columnCount = Math.floor(gridBox.width / CARD_WIDTH)
    const leftMargin = (gridBox.width - columnCount * CARD_WIDTH) / 2
    const currentColumnHeights = new Array(columnCount).fill(0)
    this.parentCache.boundingBox = gridBox
    this.parentCache.columnLefts = currentColumnHeights.map(
      (_, idx) => CARD_WIDTH * idx + leftMargin
    )

    childrenKeys.forEach((childKey) => {
      const childCache = this.childrenCache[childKey]
      // only thing we really care about here is height?
      const {height, width} = childCache.el.getBoundingClientRect()
      const top = Math.min(...currentColumnHeights)
      const shortestColumnIdx = currentColumnHeights.indexOf(top)
      const left = this.parentCache.columnLefts[shortestColumnIdx]
      childCache.boundingBox = {
        height,
        width,
        top,
        left
      }
      childCache.el.style.transform = `translate(${left}px, ${top}px)`
      currentColumnHeights[shortestColumnIdx] += height
    })
  }

  handleGridUpdate = (payload) => {
    const {
      oldReflectionGroup: {id: oldReflectionGroupId},
      reflectionGroup: {id: newReflectionGroupId}
    } = payload

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
    this.adjustGroupHeight(oldReflectionGroupId)
    if (oldReflectionGroupId !== newReflectionGroupId) {
      this.adjustGroupHeight(newReflectionGroupId)
    }
    this.shakeUpBottomCells()
  }

  shakeUpBottomCells () {
    const {columnLefts} = this.parentCache
    if (columnLefts.length === 1) return
    const lastCardPerColumn = columnLefts.reduce((obj, left) => {
      obj[left] = null
      return obj
    }, {})
    const childrenKeys = Object.keys(this.childrenCache)
    childrenKeys.forEach((childKey) => {
      const childCache = this.childrenCache[childKey]
      if (!childCache || !childCache.boundingBox) {
      }
      const {
        boundingBox: {left, top}
      } = childCache
      if (lastCardPerColumn[left] === undefined) {
      }
      if (!lastCardPerColumn[left] || lastCardPerColumn[left].boundingBox.top < top) {
        lastCardPerColumn[left] = childCache
      }
    })

    // increasing this decreases movement, but increases the probability of 1 column being much taller than the others
    const MIN_SAVINGS = 24 // in pixels, must be > 0
    // taxing the # of columns it has to move encourages shorter moves
    const COST_PER_COLUMN = 24
    for (let safeLoop = 0; safeLoop < 20; safeLoop++) {
      const totalSavings = []
      for (let ii = 0; ii < columnLefts.length; ii++) {
        // source is the suspected tall column, target is a possibly shorter column
        const sourceLeft = columnLefts[ii]
        totalSavings[ii] = new Array(columnLefts.length).fill(0)
        const sourceChildCache = lastCardPerColumn[sourceLeft]
        // if the column is empty, you can't shake anything from it
        if (!sourceChildCache) continue
        const {boundingBox: sourceBox} = sourceChildCache
        const savings = totalSavings[ii]
        for (let jj = 0; jj < columnLefts.length; jj++) {
          if (jj === ii) continue
          const targetLeft = columnLefts[jj]
          const targetBottom = lastCardPerColumn[targetLeft]
            ? lastCardPerColumn[targetLeft].boundingBox.height +
              lastCardPerColumn[targetLeft].boundingBox.top
            : 0
          const targetSavings = sourceBox.top - targetBottom
          savings[jj] = targetSavings - COST_PER_COLUMN * Math.abs(jj - ii)
        }
      }
      const topSavingsPerSource = totalSavings.map((savings) => Math.max(...savings))
      const maxSavingsValue = Math.max(...topSavingsPerSource)
      if (maxSavingsValue < MIN_SAVINGS) return
      const bestSourceIdx = topSavingsPerSource.indexOf(maxSavingsValue)
      const bestSourceLeft = columnLefts[bestSourceIdx]
      const targetSavings = totalSavings[bestSourceIdx]
      const bestTargetIdx = targetSavings.indexOf(maxSavingsValue)
      const bestTargetLeft = columnLefts[bestTargetIdx]
      const sourceChildCache = lastCardPerColumn[bestSourceLeft]
      const {boundingBox: sourceBox, el: sourceEl} = sourceChildCache
      const oldBottom = lastCardPerColumn[bestTargetLeft]

      // update the dictionary because we might shake out another move
      lastCardPerColumn[bestTargetLeft] = sourceChildCache

      // animate! move horizontally first, then vertically
      // delay each move so it looks more natural
      const {top: oldTop} = sourceBox
      sourceBox.left = bestTargetLeft
      sourceBox.top = oldBottom ? oldBottom.boundingBox.top + oldBottom.boundingBox.height : 0
      sourceEl.style.transform = `translate(${sourceBox.left}px, ${oldTop}px)`
      const AXIS_ANIMATION_DURATION = 100
      sourceEl.style.transitionDuration = `${AXIS_ANIMATION_DURATION}ms`
      const delay = (safeLoop + 1) * 100
      sourceEl.style.transitionDelay = `${delay}ms`
      setTimeout(() => {
        sourceEl.style.transitionDelay = ''
        sourceEl.style.transform = `translate(${sourceBox.left}px, ${sourceBox.top}px`
        setTimeout(() => {
          sourceEl.style.transitionDuration = ''
        }, AXIS_ANIMATION_DURATION)
      }, delay + AXIS_ANIMATION_DURATION)
    }
  }

  adjustGroupHeight (reflectionGroupId) {
    const resizedChildCache = this.childrenCache[reflectionGroupId]
    if (!resizedChildCache) return
    const {el: resizedEl, boundingBox: resizedBox} = resizedChildCache
    const newHeight = resizedEl.getBoundingClientRect().height
    if (newHeight === 0) {
      console.log('deleting', reflectionGroupId)
      delete this.childrenCache[reflectionGroupId]
      // see if the entire column is gone
      const childrenKeys = Object.keys(this.childrenCache)
      const colExists = childrenKeys.some(
        (key) => this.childrenCache[key].boundingBox.left === resizedBox.left
      )
      if (!colExists) {
        childrenKeys.forEach((childKey) => {
          const {boundingBox, el} = this.childrenCache[childKey]
          if (boundingBox.left > resizedBox.left) {
            boundingBox.left = this.parentCache.columnLefts
              .slice()
              .reverse()
              .find((col) => col < boundingBox.left)
            el.style.transform = `translate(${boundingBox.left}px, ${boundingBox.top}px)`
          }
        })
        return
      }
    }
    if (newHeight === resizedBox.height) {
      return
    }

    const deltaHeight = newHeight - resizedBox.height
    resizedBox.height += deltaHeight

    const childrenKeys = Object.keys(this.childrenCache)
    childrenKeys.forEach((childKey) => {
      const {boundingBox, el} = this.childrenCache[childKey]
      const {left, top} = boundingBox
      if (left === resizedBox.left && top > resizedBox.top) {
        boundingBox.top += deltaHeight
        el.style.transform = `translate(${boundingBox.left}px, ${boundingBox.top}px)`
      }
    })
  }

  setChildRef = (id) => (c) => {
    if (c) {
      if (!this.childrenCache[id]) {
        this.childrenCache[id] = {el: c}
        this.parentCache.incomingId = id
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
          const {reflectionGroupId} = reflectionGroup
          return (
            <CardWrapper innerRef={this.setChildRef(reflectionGroupId)} key={reflectionGroupId}>
              <ReflectionGroup meeting={meeting} reflectionGroup={reflectionGroup} idx={idx} />
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
  drop (props: Props, monitor, component) {
    const {
      meeting: {reflectionGroups}
    } = props
    const sortOrder = reflectionGroups[reflectionGroups.length - 1].sortOrder + 1 + dndNoise()

    const {getCardRect, reflectionId, reflectionGroupId, isSingleCardGroup} = monitor.getItem()
    component.setOptimisticRect(getCardRect())
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
