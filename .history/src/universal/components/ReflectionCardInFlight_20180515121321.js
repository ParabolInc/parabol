// @flow
import type {ReflectionCardInFlight_reflection as Reflection} from './__generated__/ReflectionCardInFlight_reflection.graphql'
// $FlowFixMe
import {EditorState, convertFromRaw} from 'draft-js'
import * as React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer} from 'react-relay'
import {ReflectionCardRoot} from 'universal/components/ReflectionCard/ReflectionCard'
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import UpdateDragLocationMutation from 'universal/mutations/UpdateDragLocationMutation'
import ui from 'universal/styles/ui'
import {REFLECTION_CARD} from 'universal/utils/constants'
import UserDraggingHeader from 'universal/components/UserDraggingHeader'

type Coords = {
  x: number,
  y: number
}

type Props = {|
  atmosphere: Object,
  initialComponentOffset: Coords,
  initialCursorOffset: Coords,
  reflection: Reflection
|}

type State = {|
  x: ?number,
  y: ?number
|}

const ModalBlock = styled('div')({
  top: 0,
  left: 0,
  padding: '.25rem .5rem',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: ui.ziTooltip
})

class ReflectionCardInFlight extends React.Component<Props, State> {
  constructor (props) {
    super(props)
    const {isTeamMemberDragging} = props
    this.innerWidth = window.innerWidth
    this.editorState = EditorState.createWithContent(
      convertFromRaw(JSON.parse(this.props.reflection.content))
    )
    if (!isTeamMemberDragging) {
      this.initialComponentOffset = props.initialComponentOffset
      this.initialCursorOffset = props.initialCursorOffset
    }
  }

  state = {
    dragX: undefined,
    dragY: undefined
  }
  componentDidMount () {
    const {isTeamMemberDragging} = this.props
    if (!isTeamMemberDragging) {
      window.addEventListener('drag', this.setDragState)
    }
  }

  componentWillUnmount () {
    const {isTeamMemberDragging} = this.props
    if (!isTeamMemberDragging) {
      window.removeEventListener('drag', this.setDragState)
    }
  }

  setDragState = (e) => {
    const {
      atmosphere,
      reflection: {
        reflectionId,
        team: {teamId}
      }
    } = this.props
    const xDiff = e.x - this.initialCursorOffset.x
    const yDiff = e.y - this.initialCursorOffset.y
    const x = this.initialComponentOffset.x + xDiff
    const y = this.initialComponentOffset.y + yDiff
    if (x !== this.state.x || y !== this.state.y) {
      this.setState({
        x,
        y
      })
      const input = {
        clientWidth: this.innerWidth,
        coords: {x, y},
        distance: 0,
        sourceId: reflectionId,
        teamId,
        draggableType: REFLECTION_CARD,
        targetId: 'unknown'
      }
      UpdateDragLocationMutation(atmosphere, {input})
    }
  }

  editorState: Object
  initialComponentOffset: Coords
  initialCursorOffset: Coords

  render () {
    const {
      reflection: {dragContext},
      isTeamMemberDragging
    } = this.props
    const {x, y} = isTeamMemberDragging ? dragContext.dragCoords : this.state
    const transform = `translate3d(${x}px, ${y}px, 0px)`
    return (
      <ModalBlock style={{transform}}>
        <ReflectionCardRoot>
          {isTeamMemberDragging && <UserDraggingHeader user={dragContext.draggerUser} />}
          <ReflectionEditorWrapper editorState={this.editorState} readOnly />
        </ReflectionCardRoot>
      </ModalBlock>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(ReflectionCardInFlight),
  graphql`
    fragment ReflectionCardInFlight_reflection on RetroReflection {
      team {
        teamId: id
      }
      reflectionId: id
      content
      dragContext {
        dragCoords {
          x
          y
        }
        draggerUser {
          ...UserDraggingHeader_user
        }
      }
    }
  `
)
