import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DropTarget} from 'react-dnd'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {REFLECTION_CARD} from 'universal/utils/constants'
import type {PhaseItemMasonry_meeting as Meeting} from './__generated__/PhaseItemMasonry_meeting.graphql'
import dndNoise from 'universal/utils/dndNoise'
import UpdateReflectionLocationMutation from 'universal/mutations/UpdateReflectionLocationMutation'
import FlipMove from 'react-flip-move'
import styled, {css} from 'react-emotion'
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup'

type Props = {|
  meeting: Meeting
|}

export const CARD_PADDING = 8
const CARD_WIDTH = 304 + CARD_PADDING * 2
// const MIN_CARD_HEIGHT = 48
export const GRID_ROW_HEIGHT = 8

const GridStyle = css({
  display: 'grid',
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

  componentDidUpdate (prevProps) {
    const {
      meeting: {reflectionGroups: oldReflectionGroups}
    } = prevProps
    const {
      meeting: {reflectionGroups}
    } = this.props
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
    })
  }

  shakeUpBottomCells (longColumn) {
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
    const deltaHeight = newHeight - cachedGroup.height
    cachedGroup.height = newHeight
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

  // componentWillUnmount () {
  //   window.removeEventListener('resize', this.handleResize)
  // }
  gridCache = new Map()
  // wrapperRefs = {}

  setWrapperRefs = (id) => (c) => {
    if (!c) {
      return
      // TODO cleanup later
      // this.gridCache.delete(id)
    }
    // this.wrapperRefs[id] = c
    const cachedCell = this.gridCache.get(id)
    if (!cachedCell) {
      const {left, top, height} = c.getBoundingClientRect()
      this.gridCache.set(id, {
        ref: c,
        column: left,
        // scroll height?
        height,
        top
      })
    }
  }

  renderReflections = () => {
    const {meeting} = this.props
    const {reflectionGroups} = meeting
    return reflectionGroups.map((reflectionGroup, idx) => {
      const {reflectionGroupId} = reflectionGroup
      const cachedCell = this.gridCache.get(reflectionGroupId)
      return (
        <CardWrapper height={cachedCell ? cachedCell.height : 0} key={reflectionGroupId}>
          <ReflectionGroup
            innerRef={this.setWrapperRefs(reflectionGroupId)}
            meeting={meeting}
            reflectionGroup={reflectionGroup}
          />
        </CardWrapper>
      )
    })
  }

  setGridRef = (c) => {
    this.gridRef = c
  }

  render () {
    const {connectDropTarget} = this.props
    return connectDropTarget(
      <div
        ref={this.setGridRef}
        // style={{gridTemplateRows: `repeat(${gridRows}, ${GRID_ROW_HEIGHT}px)`}}
        className={GridStyle}
      >
        <FlipMove
          staggerDurationBy='30'
          duration={5000}
          enterAnimation={null}
          leaveAnimation={null}
          typeName={null}
        >
          {this.renderReflections()}
        </FlipMove>
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
