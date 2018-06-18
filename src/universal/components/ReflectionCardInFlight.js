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
import UserDraggingHeader from 'universal/components/UserDraggingHeader'
import ReflectionFooter from 'universal/components/ReflectionFooter'
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray'
import getTargetReference from 'universal/utils/multiplayerMasonry/getTargetReference'
import shakeUpBottomCells from 'universal/utils/multiplayerMasonry/shakeUpBottomCells'

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
    const {initialComponentCoords, initialCursorCoords} = dragContext
    this.innerWidth = window.innerWidth
    this.innerHeight = window.innerHeight
    this.scrollX = window.scrollX
    this.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(content)))
    // synonymous to isClientDragging
    if (initialComponentCoords) {
      this.state = {...initialComponentCoords}
      this.cursorOffset = {
        x: initialCursorCoords.x - initialComponentCoords.x,
        y: initialCursorCoords.y - initialComponentCoords.y
      }
    }
  }

  componentDidMount () {
    const {
      childrenCache,
      reflection: {
        reflectionGroupId,
        dragContext: {isViewerDragging}
      }
    } = this.props
    if (isViewerDragging) {
      const childCache = childrenCache[reflectionGroupId]
      childCache.itemEl.addEventListener('drag', this.setViewerDragState)
    }
  }

  componentWillUnmount () {
    const {
      childrenCache,
      reflection: {
        reflectionGroupId,
        dragContext: {isViewerDragging}
      }
    } = this.props
    if (isViewerDragging) {
      const childCache = childrenCache[reflectionGroupId]
      childCache.itemEl.removeEventListener('drag', this.setViewerDragState)
    }
  }

  handleTransitionEnd = () => {
    const {
      atmosphere,
      cardsInFlight,
      childrenCache,
      parentCache,
      reflection: {meetingId, reflectionId}
    } = this.props
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      const reflection = store.get(reflectionId)
      reflection.setValue(null, 'dragContext')
      safeRemoveNodeFromArray(reflectionId, meeting, 'reflectionsInFlight')
    })
    delete cardsInFlight[reflectionId]
    shakeUpBottomCells(childrenCache, parentCache.columnLefts)
  }

  setViewerDragState = (e) => {
    const {
      atmosphere,
      childrenCache,
      parentCache,
      reflection: {
        dragContext: {initialCursorCoords, initialComponentCoords, isPending, isViewerDragging},
        reflectionId,
        team: {teamId}
      }
    } = this.props
    // the drag event keeps firing if dragend was programmatically fired
    if (!isViewerDragging) return
    // if i scroll off the screen, leave it where I last saw it
    if (e.x === 0 && e.y === 0) return
    const xDiff = e.x - initialCursorCoords.x
    const yDiff = e.y - initialCursorCoords.y
    // TODO remove window.scrollX by caching it or ???
    const nextCoords = {
      x: initialComponentCoords.x + xDiff + this.scrollX,
      y: initialComponentCoords.y + yDiff
    }
    if (nextCoords.x !== this.state.x || nextCoords.y !== this.state.y) {
      /*
       * coords using relay: ~45fps
       * coords using this.setState: ~60fps
       * coords using this.coords and direct dom manipulation: ~60fps
       * setState is nearly identical as direct dom manipulation & pattern is the same for local & remote drags
       */
      this.setState(nextCoords)
      // dont send updates too frequently & don't send them until the start message got back, since it'll be ignored by clients
      if (this.isBroadcasting || isPending) return
      this.isBroadcasting = true
      const cursorCoords = {x: e.x, y: e.y}
      const {targetId, targetOffset} = getTargetReference(
        childrenCache,
        parentCache,
        cursorCoords,
        this.cursorOffset,
        this.cachedTargetId
      )
      this.cachedTargetId = targetId
      const input = {
        clientHeight: this.innerHeight,
        clientWidth: this.innerWidth,
        coords: nextCoords,
        sourceId: reflectionId,
        teamId,
        targetId,
        targetOffset
      }
      UpdateDragLocationMutation(atmosphere, {input})
      setTimeout(() => {
        this.isBroadcasting = false
      }, 10)
    }
  }

  editorState: Object

  render () {
    const {
      reflection: {
        reflectionId,
        dragContext: {isClosing, isViewerDragging, initialCursorCoords, dragCoords, dragUser},
        phaseItem: {question}
      },
      setInFlightCoords
    } = this.props
    // use initialCoords instead of isViewerDragging as a cheap hack to support the same user in 2 tabs
    const {x, y} = isClosing || !initialCursorCoords ? dragCoords : this.state
    setInFlightCoords(x, y, reflectionId)

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
      reflectionGroupId
      content
      dragContext {
        isClosing
        isPending
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
