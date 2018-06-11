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
import ReflectionFooter from 'universal/components/ReflectionFooter'

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
      this.state = {
        x: this.initialComponentOffset.x,
        y: this.initialComponentOffset.y
      }
    }
  }

  componentDidMount () {
    const {isTeamMemberDragging} = this.props
    if (!isTeamMemberDragging) {
      window.addEventListener('drag', this.setDragState)
    }
  }

  componentWillUnmount () {
    console.log('unmount inflight')
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
    // if i scroll off the screen, leave it where I last saw it
    if (e.x === 0 && e.y === 0) return
    const x = this.initialComponentOffset.x + xDiff + window.scrollX
    const y = this.initialComponentOffset.y + yDiff
    if (x !== this.state.x || y !== this.state.y) {
      /*
       * coords using relay: ~45fps
       * coords using this.setState: ~60fps
       * coords using this.coords and direct dom manipulation: ~60fps
       * setState is nearly identical as direct dom manipulation & pattern is the same for local & remote drags
       */
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
      reflection: {
        reflectionId,
        dragContext,
        phaseItem: {question}
      },
      setInFlightCoords,
      isTeamMemberDragging,
      reflectionRef,
      closingTransform,
      handleTransitionEnd
    } = this.props

    const {x, y} = isTeamMemberDragging ? dragContext.dragCoords : this.state
    if (isTeamMemberDragging && x === undefined) return null
    setInFlightCoords(x, y, reflectionId, reflectionRef)
    const style = {
      // smooth the jank caused by latency
      transition: closingTransform
        ? 'transform .2s cubic-bezier(0, 0, .2, 1)'
        : isTeamMemberDragging
          ? 'transform .1s cubic-bezier(0, 0, .2, 1)'
          : undefined,
      transform: closingTransform || `translate3d(${x}px, ${y}px, 0px)`
    }
    // console.log(`inflight ISDRAGGING: ${isDragging}, TEAM: ${isTeamMemberDragging}, CLOSE: ${closingTransform}, COORDS: ${x},${y}`)
    return (
      <ModalBlock style={style} onTransitionEnd={handleTransitionEnd}>
        <ReflectionCardRoot>
          {isTeamMemberDragging && <UserDraggingHeader user={dragContext.draggerUser} />}
          <ReflectionEditorWrapper editorState={this.editorState} readOnly />
          <ReflectionFooter>{question}</ReflectionFooter>
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
      phaseItem {
        question
      }
    }
  `
)
