import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer} from 'react-relay'
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  Masonry,
  createMasonryCellPositioner
} from 'react-virtualized'
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup'
import type {PhaseItemMasonry_meeting as Meeting} from './__generated__/PhaseItemMasonry_meeting.graphql'

type Props = {|
  meeting: Meeting
|}

const CARD_WIDTH = 328 // 8 px of padding?
const MIN_CARD_HEIGHT = 48
const GUTTER = 8

const MasonryStyles = styled('div')({
  flex: '1 1 auto',
  padding: 8
})

class PhaseItemMasonry extends React.Component<Props> {
  constructor (props) {
    super(props)
    this.cellCache = new CellMeasurerCache({
      defaultHeight: MIN_CARD_HEIGHT,
      defaultWidth: CARD_WIDTH,
      fixedWidth: true,
      keyMapper: this.keyMapper
    })
  }

  keyMapper = (idx) => {
    const {meeting} = this.props
    const {reflectionGroups} = meeting
    const reflectionGroup = reflectionGroups[idx]
    return reflectionGroup.reflectionGroupId
  }

  getPositioner = (width) => {
    if (width !== this.width || !this.cellPositioner) {
      this.setColumnCount(width)
      this.cellPositioner = createMasonryCellPositioner({
        cellMeasurerCache: this.cellCache,
        columnCount: this.columnCount,
        columnWidth: CARD_WIDTH,
        spacer: GUTTER
      })
    }
    return this.cellPositioner
  }

  cellRenderer = ({index, key, parent, style}) => {
    const {meeting} = this.props
    const {reflectionGroups} = meeting
    const reflectionGroup = reflectionGroups[index]
    return (
      <CellMeasurer cache={this.cellCache} index={index} key={key} parent={parent}>
        <div style={style}>
          <ReflectionGroup meeting={meeting} reflectionGroup={reflectionGroup} />
        </div>
      </CellMeasurer>
    )
  }

  onResize = ({width}) => {
    this.setColumnCount(width)
    this.cellPositioner.reset({
      columnCount: this.columnCount,
      columnWidth: CARD_WIDTH,
      spacer: GUTTER
    })
    this.masonryRef.recomputeCellPositions()
  }

  setColumnCount = (width) => {
    this.width = width
    this.columnCount = Math.floor(width / (CARD_WIDTH + GUTTER))
  }

  setMasonryRef = (c) => {
    this.masonryRef = c
  }

  render () {
    const {meeting} = this.props
    const {reflectionGroups} = meeting

    return (
      <MasonryStyles>
        <AutoSizer onResize={this.onResize}>
          {({height, width}) => {
            return (
              <Masonry
                cellCount={reflectionGroups.length}
                cellMeasurerCache={this.cellCache}
                cellPositioner={this.getPositioner(width)}
                cellRenderer={this.cellRenderer}
                height={height}
                width={width}
                ref={this.setMasonryRef}
                style={{outline: 0}}
              />
            )
          }}
        </AutoSizer>
      </MasonryStyles>
    )
  }
}

export default createFragmentContainer(
  PhaseItemMasonry,
  graphql`
    fragment PhaseItemMasonry_meeting on RetrospectiveMeeting {
      ...ReflectionGroup_meeting
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
