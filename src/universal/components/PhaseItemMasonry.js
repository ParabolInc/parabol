import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  createMasonryCellPositioner,
  Masonry
} from 'react-virtualized'
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DropTarget} from 'react-dnd'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {REFLECTION_CARD} from 'universal/utils/constants'
import type {PhaseItemMasonry_meeting as Meeting} from './__generated__/PhaseItemMasonry_meeting.graphql'
import dndNoise from 'universal/utils/dndNoise'
import UpdateReflectionLocationMutation from 'universal/mutations/UpdateReflectionLocationMutation'

type Props = {|
  meeting: Meeting
|}

export const CARD_PADDING = 8
const CARD_WIDTH = 304 + CARD_PADDING * 2
const MIN_CARD_HEIGHT = 48
const GUTTER = 0

class PhaseItemMasonry extends React.Component<Props> {
  constructor (props) {
    super(props)
    this.cellCache = new CellMeasurerCache({
      defaultHeight: MIN_CARD_HEIGHT,
      defaultWidth: CARD_WIDTH,
      fixedWidth: true
      // keyMapper: this.keyMapper
    })
  }
  componentWillUpdate (nextProps) {
    this.invalidateOnAddRemove(
      this.props.meeting.reflectionGroups,
      nextProps.meeting.reflectionGroups
    )
  }

  invalidateOnAddRemove () {
    setTimeout(() => {
      this.cellCache.clearAll()
      this.resetCellPositioner()
      this.masonryRef.clearCellPositions()
    })
  }

  initCellPositioner = () => {
    if (typeof this._cellPositioner === 'undefined') {
      this.cellPositioner = createMasonryCellPositioner({
        cellMeasurerCache: this.cellCache,
        columnCount: this.columnCount,
        columnWidth: CARD_WIDTH,
        spacer: GUTTER
      })
    }
  }

  cellRenderer = ({index, key, parent, style}) => {
    const {meeting} = this.props
    const {reflectionGroups} = meeting
    const reflectionGroup = reflectionGroups[index]
    if (!reflectionGroup) return null
    // console.log('style', style)
    return (
      <CellMeasurer cache={this.cellCache} index={index} key={key} parent={parent}>
        <div style={{...style, transition: 'all 0.5s ease-out'}}>
          <ReflectionGroup meeting={meeting} reflectionGroup={reflectionGroup} />
        </div>
      </CellMeasurer>
    )
  }

  onResize = ({width}) => {
    this.width = width
    this.setColumnCount(width)
    this.resetCellPositioner()
    this.masonryRef.recomputeCellPositions()
  }

  setColumnCount = () => {
    this.columnCount = Math.floor(this.width / (CARD_WIDTH + GUTTER))
  }

  setGridRef = (c) => {
    this.gridRef = c
  }

  setMasonryRef = (c) => {
    this.masonryRef = c
  }

  resetCellPositioner = () => {
    this.cellPositioner.reset({
      // cellMeasurerCache: this.cellCache,
      columnCount: this.columnCount,
      columnWidth: CARD_WIDTH,
      spacer: GUTTER
    })
  }
  renderMasonry = ({height, width}) => {
    const {meeting} = this.props
    const {reflectionGroups} = meeting

    this.width = width
    this.setColumnCount()
    this.initCellPositioner()

    return (
      <Masonry
        cellCount={reflectionGroups.length}
        cellMeasurerCache={this.cellCache}
        cellPositioner={this.cellPositioner}
        cellRenderer={this.cellRenderer}
        height={height}
        width={width}
        ref={this.setMasonryRef}
        style={{outline: 0, padding: 8}}
      />
    )
  }

  renderAutoSizer = () => {
    return <AutoSizer onResize={this.onResize}>{this.renderMasonry}</AutoSizer>
  }
  render () {
    const {connectDropTarget} = this.props

    return connectDropTarget(
      <div style={{flex: '1 1 auto'}} ref={this.setGridRef}>
        {this.renderAutoSizer()}
      </div>
    )
  }
}

const reflectionDropSpec = {
  canDrop (props: Props, monitor) {
    return monitor.isOver({shallow: true})
  },
  // Makes the card-dropped-into available in the dragSpec's endDrag method.
  drop (props: Props, monitor, component) {
    const {x, y} = monitor.getClientOffset()
    const {
      meeting: {reflectionGroups}
    } = props
    const {gridRef, cellCache, columnCount} = component
    const gridRect = gridRef.getBoundingClientRect()
    const {left, top} = gridRect
    const xPos = x - left
    const yPos = y - top
    let columnIdx = Math.round(xPos / CARD_WIDTH)
    let isAfter = 0
    if (columnIdx >= columnCount) {
      columnIdx = columnCount - 1
      isAfter = 1
    }
    const {_cellHeightCache: heightCache} = cellCache
    const cellIds = Object.keys(heightCache)
    let cellIdx = cellIds.length
    const columnHeights = {}
    for (let ii = 0; ii < columnCount; ii++) {
      columnHeights[ii] = 0
    }
    for (let ii = 0; ii < cellIds.length; ii++) {
      const cellId = cellIds[ii]
      const curColumnIdx = +cellId[0] % columnCount
      columnHeights[curColumnIdx] += heightCache[cellId]
      if (curColumnIdx === columnIdx) {
        const rowHeight = columnHeights[curColumnIdx]
        if (yPos < rowHeight) {
          cellIdx = ii + isAfter
          break
        }
      }
    }

    let sortOrder
    if (cellIdx === 0) {
      sortOrder = reflectionGroups[0].sortOrder - 1 + dndNoise()
    } else if (cellIdx === reflectionGroups.length) {
      sortOrder = reflectionGroups[reflectionGroups.length - 1].sortOrder + 1 + dndNoise()
    } else {
      sortOrder =
        (reflectionGroups[cellIdx - 1].sortOrder + reflectionGroups[cellIdx].sortOrder) / 2 +
        dndNoise()
    }

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
          id
          retroPhaseItemId
          sortOrder
        }
      }
    }
  `
)
