import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DropTarget} from 'react-dnd'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {REFLECTION_CARD} from 'universal/utils/constants'
import type {PhaseItemMasonry_meeting as Meeting} from './__generated__/PhaseItemMasonry_meeting.graphql'
import dndNoise from 'universal/utils/dndNoise'
import UpdateReflectionLocationMutation from 'universal/mutations/UpdateReflectionLocationMutation'
import styled, {css} from 'react-emotion'
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup'
import isTempId from 'universal/utils/relay/isTempId'

type Props = {|
  meeting: Meeting
|}

export const CARD_PADDING = 8
const CARD_WIDTH = 304 + CARD_PADDING * 2
// const MIN_CARD_HEIGHT = 48
export const GRID_ROW_HEIGHT = 8

const GridStyle = css({
  // display: 'grid',
  gridTemplateColumns: `repeat(auto-fill,${CARD_WIDTH}px)`,
  // gridTemplateRows: `repeat(${rows}, ${GRID_ROW_HEIGHT}px)`,
  gridAutoRows: GRID_ROW_HEIGHT,
  gridAutoColumns: '1fr',
  // gridAutoFlow: 'column',
  justifyContent: 'center',
  overflow: 'auto',
  position: 'relative',
  width: '100%'
})

const CardWrapper = styled('div')(({height}) => ({
  position: 'relative',
  listStyleType: 'none',
  // maxWidth: 304,
  display: 'inline-block',
  gridRowEnd: `span ${Math.ceil(height / GRID_ROW_HEIGHT)}`
}))

// class GridCache {
//   constructor () {
//     this.cells = []
//   }
//
//   get (id) {
//     return this.cells.find((cell) => cell.id === id)
//   }
//
//   add (cachedCell) {
//     this.cells.push(cachedCell)
//   }
// }

const findRemovedGroup = (oldReflectionGroups, reflectionGroups) => {
  for (let ii = 0; ii < oldReflectionGroups.length; ii++) {
    const oldReflectionGroup = oldReflectionGroups[ii]
    const {reflectionGroupId: oldReflectionGroupId} = oldReflectionGroup
    const inNewGroup = reflectionGroups.find(
      (reflectionGroup) => reflectionGroup.reflectionGroupId === oldReflectionGroupId
    )
    if (inNewGroup) continue
    const {reflections} = oldReflectionGroup
    const [reflection] = reflections
    const {reflectionId} = reflection
    const newReflectionGroup = reflectionGroups.find((reflectionGroup) =>
      reflectionGroup.reflections.find((reflection) => reflection.reflectionId === reflectionId)
    )

    return {
      oldReflectionGroupId,
      newReflectionGroupId: newReflectionGroup.reflectionGroupId
    }
  }
}

class PhaseItemMasonry extends React.Component<Props> {
  // static getDerivedStateFromProps (nextProps: Props, prevState: State): $Shape<State> | null {
  // }
  constructor (props) {
    super(props)
    setTimeout(() => {
      this.forceUpdate()
    }, 100)
    window.gridCache = this.gridCache
  }

  // state = {
  //   gridCache: new GridCache()
  // }

  // componentDidMount () {
  //   this.initializeGrid()
  //   window.addEventListener('resize', this.handleResize)
  // }
  componentWillReceiveProps (nextProps) {
    const {
      meeting: {reflectionGroups: newReflectionGroups}
    } = nextProps
    const {
      meeting: {reflectionGroups}
    } = this.props

    if (newReflectionGroups !== reflectionGroups) {
      this.working = true
    }
  }

  working = false

  componentDidUpdate (prevProps) {
    console.log('cDU')

    const {
      meeting: {reflectionGroups: oldReflectionGroups}
    } = prevProps
    const {
      meeting: {reflectionGroups}
    } = this.props
    // this.working = true
    if (oldReflectionGroups !== reflectionGroups) {
      if (oldReflectionGroups.length > reflectionGroups.length) {
        const {oldReflectionGroupId, newReflectionGroupId} = findRemovedGroup(
          oldReflectionGroups,
          reflectionGroups
        )
        window.requestAnimationFrame(() => {
          this.adjustGroupHeight(newReflectionGroupId)
          this.adjustGroupHeight(oldReflectionGroupId, true)
          this.gridCache.delete(oldReflectionGroupId)
          const {column} = this.gridCache.get(newReflectionGroupId)
          this.shakeUpBottomCells(column)
          this.sortForMasonry()
        })
      }
    }
  }

  sortForMasonry () {
    const {
      atmosphere,
      meeting: {meetingId}
    } = this.props
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      const reflectionGroups = meeting.getLinkedRecords('reflectionGroups')
      reflectionGroups.sort((a, b) => {
        const aId = a.getValue('id')
        const bId = b.getValue('id')
        const aCache = this.gridCache.get(aId)
        const bCache = this.gridCache.get(bId)
        if (!aCache || !bCache) return 1
        const {top: aTop, column: aCol} = aCache
        const {top: bTop, column: bCol} = bCache
        if (aTop < bTop) return -1
        if (aTop > bTop) return 1
        if (aCol < bCol) return -1
        return 1
      })
      meeting.setLinkedRecords(reflectionGroups, 'reflectionGroups')
      this.working = false
    })
  }

  shakeUpBottomCells (longColumn) {
    // currently, does not prevent cards drifting to the left visually, it's not too bad. i think we'd need a placeholder to stop it
    const bottoms = {}
    for (const [key, value] of this.gridCache.entries()) {
      const {column, top, height} = value
      if (!bottoms[column]) bottoms[column] = {maxTop: 0, bottom: 0, id: null}
      const columnBottom = bottoms[column]
      if (top > columnBottom.maxTop) {
        columnBottom.maxTop = top
        columnBottom.bottom = top + height
        columnBottom.id = key
      }
    }
    const columnKeys = Object.keys(bottoms)
    if (columnKeys.length === 1) return
    const longColumnBottom = bottoms[longColumn]

    // increasing this decreases movement, but increases the probability of 1 column being much taller than the others
    const THRESHOLD = 16
    for (let ii = 0; ii < columnKeys.length; ii++) {
      const column = columnKeys[ii]
      if (column === longColumn) continue
      const maybeShortColumn = bottoms[column]
      if (longColumnBottom.maxTop > maybeShortColumn.bottom + THRESHOLD) {
        const cachedLongBottom = this.gridCache.get(longColumnBottom.id)
        cachedLongBottom.column = column
        cachedLongBottom.top = maybeShortColumn.bottom
        return
      }
    }
  }

  adjustGroupHeight (reflectionGroupId, isRemoval) {
    const cachedGroup = this.gridCache.get(reflectionGroupId)
    const newHeight = isRemoval ? 0 : cachedGroup.ref.getBoundingClientRect().height
    if (newHeight === cachedGroup.height) {
      console.error('height didnt change')
    }
    const deltaHeight = isRemoval ? -cachedGroup.height : 28
    cachedGroup.height += deltaHeight
    const cellCachesBelow = []
    for (const [reflectionGroupId, value] of this.gridCache.entries()) {
      if (value.column === cachedGroup.column && value.top > cachedGroup.top) {
        cellCachesBelow.push(this.gridCache.get(reflectionGroupId))
      }
    }
    cellCachesBelow.forEach((cache) => {
      cache.top += deltaHeight
    })
  }
  gridCache = new Map()

  setWrapperRefs = (id) => (c) => {
    if (isTempId(id)) return
    if (!c) {
      return
      // TODO cleanup later
    }
    const cachedCell = this.gridCache.get(id)
    if (!cachedCell) {
      // requestAnimationFrame(() => {

      const {left, height} = c.getBoundingClientRect()
      const arr = Array.from(this.gridCache)
      const top = arr.reduce((top, [id, cache]) => {
        return cache.column === left ? top + cache.height : top
      }, 0)
      this.gridCache.set(id, {
        ref: c,
        column: left,
        height,
        top
        // rowStart:
      })
      // })
    }
  }

  cachedReflections = null
  renderReflections = () => {
    const {meeting} = this.props
    const {reflectionGroups} = meeting
    // if (this.working) return this.cachedReflections
    this.cachedReflections = reflectionGroups.map((reflectionGroup, idx) => {
      const {reflectionGroupId} = reflectionGroup
      const cachedCell = this.gridCache.get(reflectionGroupId)
      return (
        <CardWrapper height={cachedCell ? cachedCell.height : 0} idx={idx} key={reflectionGroupId}>
          <ReflectionGroup
            innerRef={this.setWrapperRefs(reflectionGroupId)}
            meeting={meeting}
            reflectionGroup={reflectionGroup}
            idx={idx}
          />
        </CardWrapper>
      )
    })
    return this.cachedReflections
  }

  setGridRef = (c) => {
    this.gridRef = c
  }

  render () {
    console.log('render')
    const {connectDropTarget} = this.props
    // if (this.working) return null
    return connectDropTarget(
      <div
        ref={this.setGridRef}
        // style={{gridTemplateRows: `repeat(${gridRows}, ${GRID_ROW_HEIGHT}px)`}}
        className={GridStyle}
      >
        {/* <FlipMove */}
        {/* appearAnimation */}
        {/* staggerDurationBy='20' */}
        {/* duration={1000} */}
        {/* enterAnimation */}
        {/* leaveAnimation={false} */}
        {/* typeName={null} */}
        {/* > */}
        {this.renderReflections()}
        {/* </FlipMove> */}
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

window.sortGridCache = () => {
  Array.from(window.gridCache)
    .sort((a, b) => {
      const aCache = a[1]
      const bCache = b[1]
      if (!aCache || !bCache) return 1
      const {top: aTop, column: aCol} = aCache
      const {top: bTop, column: bCol} = bCache
      if (aTop < bTop) return -1
      if (aTop > bTop) return 1
      if (aCol < bCol) return -1
      return 1
    })
    .forEach((cell) => {
      console.log(
        `col: ${cell[1].column} | top: ${cell[1].top} | height: ${cell[1].height} | id: ${cell[0]}`
      )
      // return
    })
  // void
}
