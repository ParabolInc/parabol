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
import {DECELERATE} from 'universal/styles/animation'
import type {
  ChildId,
  ChildrenCache,
  InFlightCoords,
  ItemId,
  ParentCache
} from 'universal/components/PhaseItemMasonry'

type Props = {|
  atmosphere: Object,
  childrenCache: ChildrenCache,
  parentCache: ParentCache,
  reflection: Reflection,
  setInFlightCoords: (x: ?number, y: ?number, itemId: ?ItemId) => void,
  teamId: string
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
  if (!isViewerDragging) {
    // cards that i dont control shouldn't go too fast
    return `transform 1000ms ${DECELERATE}`
  }
  if (isClosing) {
    return `transform 200ms ${DECELERATE}`
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
      reflection: {dragContext}
    } = this.props
    if (dragContext && dragContext.isViewerDragging) {
      // firefox doesn't report coords for the 'drag' event, so instead, we use the dragover on the document
      document.addEventListener('dragover', this.setViewerDragState)
    }
  }

  componentWillUnmount () {
    const {
      reflection: {dragContext}
    } = this.props
    if (dragContext && dragContext.isViewerDragging) {
      document.removeEventListener('dragover', this.setViewerDragState)
    }
  }

  removeCardInFlight = () => {
    const {
      atmosphere,
      childrenCache,
      parentCache,
      reflection: {meetingId, reflectionId}
    } = this.props
    const {cardsInFlight, columnLefts} = parentCache
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      safeRemoveNodeFromArray(reflectionId, meeting, 'reflectionsInFlight')
      const reflection = store.get(reflectionId)
      const dragContext = reflection.getLinkedRecord('dragContext')
      if (!dragContext) return
      // critically important! relay will try to reuse this for other reflections
      store.delete(dragContext.getDataID())
      reflection.setValue(null, 'dragContext')
    })
    delete cardsInFlight[reflectionId]
    shakeUpBottomCells(childrenCache, columnLefts)
  }

  setViewerDragState = (e: DragEvent) => {
    const {
      atmosphere,
      childrenCache,
      parentCache,
      teamId,
      reflection: {dragContext, reflectionId}
    } = this.props
    // the drag event keeps firing if dragend was programmatically fired
    if (!dragContext || !dragContext.isViewerDragging) return
    const {initialCursorCoords, initialComponentCoords, isPendingStartDrag} = dragContext
    const cursorCoords = {x: e.clientX, y: e.clientY}
    // if i scroll off the screen, leave it where I last saw it
    if (cursorCoords.x === 0 && cursorCoords.y === 0) return
    // $FlowFixMe
    const xDiff = cursorCoords.x - initialCursorCoords.x
    // $FlowFixMe
    const yDiff = cursorCoords.y - initialCursorCoords.y
    const nextCoords = {
      // $FlowFixMe
      x: initialComponentCoords.x + xDiff + this.scrollX,
      // $FlowFixMe
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
      if (this.isBroadcasting || isPendingStartDrag) return
      this.isBroadcasting = true
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
  isBroadcasting: boolean = false
  innerWidth: number = 0
  innerHeight: number = 0
  scrollX: number = 0
  cachedTargetId: ?ChildId
  cursorOffset: ?InFlightCoords

  render () {
    const {
      reflection: {
        reflectionId,
        dragContext,
        phaseItem: {question}
      },
      setInFlightCoords
    } = this.props
    if (!dragContext) return null
    const {isClosing, isViewerDragging, dragCoords, dragUser} = dragContext
    // $FlowFixMe
    const {x, y} = dragCoords && (isClosing || !isViewerDragging) ? dragCoords : this.state
    setInFlightCoords(x, y, reflectionId)

    const style = {
      transition: makeTransition(isClosing, isViewerDragging),
      transform: `translate3d(${x || 0}px, ${y || 0}px, 0px)`
    }
    return (
      <ModalBlock style={style} onTransitionEnd={isClosing ? this.removeCardInFlight : undefined}>
        <ReflectionCardRoot isClosing={isClosing} shadow={2}>
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
      reflectionId: id
      reflectionGroupId
      content
      dragContext {
        isClosing
        isPendingStartDrag
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
