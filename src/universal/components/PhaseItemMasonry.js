import React from 'react'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DropTarget} from 'react-dnd'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {REFLECTION_CARD} from 'universal/utils/constants'
import type {PhaseItemMasonry_meeting as Meeting} from './__generated__/PhaseItemMasonry_meeting.graphql'
import dndNoise from 'universal/utils/dndNoise'
import UpdateReflectionLocationMutation from 'universal/mutations/UpdateReflectionLocationMutation'
import FlipMove from 'react-flip-move'
import {css} from 'react-emotion'
import ReflectionGroupGridWrapper from 'universal/components/ReflectionGroupGridWrapper'

type Props = {|
  meeting: Meeting
|}

export const CARD_PADDING = 8
const CARD_WIDTH = 304 + CARD_PADDING * 2
// const MIN_CARD_HEIGHT = 48
export const GRID_ROW_HEIGHT = 8

const GridStyle = css({
  display: 'grid',
  gridTemplateColumns: `repeat(4,${CARD_WIDTH}px)`,
  // gridTemplateRows: `repeat(${rows}, ${GRID_ROW_HEIGHT}px)`,
  gridAutoRows: GRID_ROW_HEIGHT,
  gridAutoColumns: '1fr',
  gridAutoFlow: 'column',
  // justifyContent: 'center',
  overflow: 'auto',
  position: 'relative',
  width: '100%'
})

class PhaseItemMasonry extends React.Component<Props> {
  state = {
    gridRows: 0
  }

  componentDidMount () {
    this.initializeGrid()
    window.addEventListener('resize', this.handleResize)
  }

  componentDidUpdate () {
    // this.removeExtraGridWidth()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResize)
  }

  wrapperRefs = {}

  renderReflections = () => {
    const {meeting} = this.props
    const {reflectionGroups} = meeting
    window.wr = this.wrapperRefs
    return reflectionGroups.filter((g) => g.reflections.length).map((reflectionGroup, idx) => {
      if (!reflectionGroup) {
        console.log('UNDEF PARENT')
      }
      return (
        <ReflectionGroupGridWrapper
          key={reflectionGroup.reflectionGroupId}
          meeting={meeting}
          reflectionCount={reflectionGroup.reflections.length}
          reflectionGroup={reflectionGroup}
        />
      )
    })
  }

  initializeGrid = () => {
    this.setState({
      gridRows: 50
    })
  }

  handleResize = () => {
    this.initializeGrid()
  }
  removeExtraGridWidth = () => {
    const {scrollWidth, clientWidth} = this.gridRef
    if (scrollWidth > clientWidth) {
      this.setState({
        gridRows: this.state.gridRows + 12
      })
    }
  }

  setGridRef = (c) => {
    this.gridRef = c
  }

  render () {
    const {connectDropTarget} = this.props
    const {gridRows} = this.state
    return connectDropTarget(
      <div
        ref={this.setGridRef}
        style={{gridTemplateRows: `repeat(${gridRows}, ${GRID_ROW_HEIGHT}px)`}}
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
          id
          retroPhaseItemId
          sortOrder
        }
      }
    }
  `
)
