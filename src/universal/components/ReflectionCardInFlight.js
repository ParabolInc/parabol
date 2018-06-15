// @flow
import type {ReflectionCardInFlight_reflection as Reflection} from './__generated__/ReflectionCardInFlight_reflection.graphql'
// $FlowFixMe
import {convertFromRaw, EditorState} from 'draft-js'
import * as React from 'react'
import styled from 'react-emotion'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import {ReflectionCardRoot} from 'universal/components/ReflectionCard/ReflectionCard'
import ReflectionEditorWrapper from 'universal/components/ReflectionEditorWrapper'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import UpdateDragLocationMutation from 'universal/mutations/UpdateDragLocationMutation'
import ui from 'universal/styles/ui'
import {REFLECTION_CARD} from 'universal/utils/constants'
import UserDraggingHeader from 'universal/components/UserDraggingHeader'
import ReflectionFooter from 'universal/components/ReflectionFooter'
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray'

type Props = {|
  atmosphere: Object,
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

const makeTransition = (isClosing, isViewerDragging) => {
  if (isClosing) {
    return 'transform 200ms cubic-bezier(0, 0, .2, 1)'
  } else if (!isViewerDragging) {
    return 'transform 100ms cubic-bezier(0, 0, .2, 1)'
  }
  return undefined
}

class ReflectionCardInFlight extends React.Component<Props, State> {
  constructor (props) {
    super(props)
    const {
      reflection: {content, dragContext}
    } = props
    const {
      isViewerDragging,
      initialComponentCoords: {x, y}
    } = dragContext
    this.innerWidth = window.innerWidth
    this.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(content)))
    if (isViewerDragging) {
      this.state = {
        x,
        y
      }
    }
  }

  componentDidMount () {
    const {
      reflection: {
        dragContext: {isViewerDragging}
      }
    } = this.props
    if (isViewerDragging) {
      window.addEventListener('drag', this.setViewerDragState)
    }
  }

  componentWillUnmount () {
    const {
      reflection: {
        dragContext: {isViewerDragging}
      }
    } = this.props
    if (isViewerDragging) {
      window.removeEventListener('drag', this.setViewerDragState)
    }
  }

  handleTransitionEnd = () => {
    console.log('handling tranny end')
    const {
      atmosphere,
      reflection: {meetingId, reflectionId}
    } = this.props
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      const reflection = store.get(reflectionId)
      reflection.setValue(null, 'dragContext')
      safeRemoveNodeFromArray(reflectionId, meeting, 'reflectionsInFlight')
    })
  }

  setViewerDragState = (e) => {
    const {
      atmosphere,
      reflection: {
        dragContext: {initialCursorCoords, initialComponentCoords},
        reflectionId,
        team: {teamId}
      }
    } = this.props
    // if i scroll off the screen, leave it where I last saw it
    if (e.x === 0 && e.y === 0) return
    const xDiff = e.x - initialCursorCoords.x
    const yDiff = e.y - initialCursorCoords.y
    // TODO remove window.scrollX by caching it or ???
    const x = initialComponentCoords.x + xDiff + window.scrollX
    const y = initialComponentCoords.y + yDiff
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

  render () {
    const {
      reflection: {
        reflectionId,
        dragContext: {isClosing, isViewerDragging, dragCoords, dragUser},
        phaseItem: {question}
      },
      setInFlightCoords,
      reflectionRef
    } = this.props
    const {x, y} = isClosing || !isViewerDragging ? dragCoords : this.state
    // if (isTeamMemberDragging && x === undefined) return null
    setInFlightCoords(x, y, reflectionId, reflectionRef)
    const style = {
      transition: makeTransition(isClosing, isViewerDragging),
      transform: `translate3d(${x}px, ${y}px, 0px)`
    }
    return (
      <ModalBlock style={style} onTransitionEnd={isClosing ? this.handleTransitionEnd : undefined}>
        <ReflectionCardRoot>
          {!isViewerDragging && <UserDraggingHeader user={dragUser} />}
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
      meetingId
      team {
        teamId: id
      }
      reflectionId: id
      content
      dragContext {
        isClosing
        isViewerDragging
        dragCoords {
          x
          y
        }
        dragUser {
          id
          ...UserDraggingHeader_user
        }
        initialCursorCoords {
          x
          y
        }
        initialComponentCoords {
          x
          y
        }
      }
      phaseItem {
        question
      }
    }
  `
)
