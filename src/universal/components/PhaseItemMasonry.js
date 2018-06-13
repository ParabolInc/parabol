import React from 'react'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {DropTarget} from 'react-dnd'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {REFLECTION_CARD, REFLECTION_GRID, REFLECTION_GROUP} from 'universal/utils/constants'
import type {PhaseItemMasonry_meeting as Meeting} from './__generated__/PhaseItemMasonry_meeting.graphql'
import dndNoise from 'universal/utils/dndNoise'
import UpdateReflectionLocationMutation from 'universal/mutations/UpdateReflectionLocationMutation'
import styled, {css} from 'react-emotion'
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup'
import shakeUpBottomCells from 'universal/utils/multiplayerMasonry/shakeUpBottomCells'
import initializeGrid from 'universal/utils/multiplayerMasonry/initializeGrid'
import updateColumnHeight from 'universal/utils/multiplayerMasonry/updateColumnHeight'
import isTempId from 'universal/utils/relay/isTempId'
import setClosingTransform from 'universal/utils/multiplayerMasonry/setClosingTransform'
import handleDropOnGrid from 'universal/utils/multiplayerMasonry/handleDropOnGrid'
import appTheme from 'universal/styles/theme/appTheme'

type Props = {|
  meeting: Meeting
|}

export const CARD_PADDING = 8
export const REFLECTION_WIDTH = 320 + CARD_PADDING * 2

const gridStyle = css({
  overflow: 'auto',
  position: 'relative',
  width: '100%'
})

const CardWrapper = styled('div')({
  position: 'absolute',
  display: 'inline-block',
  transition: 'all 200ms'
})

// a reflectionId grid has many reflectionGroups has many reflections (parent > child > item)
type ItemId = string

// reflectionGroupId
type ChildId = string

type InFlightCoords = {
  x: number,
  y: number
}

type ParentCache = {
  el: ?HTMLElement,
  boundingBox: ?ClientRect,
  columnLefts: Array<number>,
  cardsInFlight: {[ItemId]: InFlightCoords},
  // the location for a group that has not been created yet (caused by an ungrouping)
  incomingChildren: {
    [ItemId]: {
      boundingBox: ?ClientRect,
      // the optimistic child that currently represents the group
      childId: ChildId
    }
  }
}

type ChildCache = {
  // reflection group element
  el: ?HTMLElement,
  // first reflection element
  itemEl: ?HTMLElement,
  // boundingBox coords are relative to the parentCache!
  boundingBox: ?ClientRect
}

type ChildrenCache = {
  [ChildId]: ChildCache
}

class PhaseItemMasonry extends React.Component<Props> {
  constructor (props) {
    super(props)
    const {
      atmosphere: {eventEmitter}
    } = props
    eventEmitter.on('updateReflectionLocation', this.handleGridUpdate)
    eventEmitter.on('dragReflection', this.handleDragEnd)
  }

  parentCache: ParentCache = {
    el: null,
    boundingBox: null,
    columnLefts: [],
    cardsInFlight: {},
    incomingChildren: {}
  }

  childrenCache: ChildrenCache = {}

  componentDidMount () {
    initializeGrid(this.childrenCache, this.parentCache, true)
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount () {
    const {
      atmosphere: {eventEmitter}
    } = this.props
    eventEmitter.off('updateReflectionLocation', this.handleGridUpdate)
    eventEmitter.off('dragReflection', this.handleDragEnd)
    window.removeEventListener('resize', this.handleResize)
  }

  handleDragEnd = (payload) => {
    const {atmosphere} = this.props
    const {dropTargetType, dropTargetId, childId, itemId} = payload
    const childCache = this.childrenCache[childId]
    if (dropTargetType === REFLECTION_GRID) {
      handleDropOnGrid(atmosphere, this.childrenCache, this.parentCache, childCache, itemId)
    } else if (dropTargetType === REFLECTION_GROUP) {
      const {itemEl: targetEl} = this.childrenCache[dropTargetId]
      const {left: targetLeft, top: targetTop} = targetEl.getBoundingClientRect()
      setClosingTransform(atmosphere, itemId, targetLeft, targetTop)
    } else {
      const originalLocation = childCache.itemEl.getBoundingClientRect()
      setClosingTransform(atmosphere, itemId, originalLocation.left, originalLocation.top)
    }
  }

  setInFlightCoords = (x: number, y: number, itemId: ItemId) => {
    // this is called frequently. keep it cheap!
    this.parentCache.cardsInFlight[itemId] = {
      x,
      y
    }
  }

  handleResize = () => {
    initializeGrid(this.childrenCache, this.parentCache, false)
  }

  handleGridUpdate = (payload) => {
    const {
      oldReflectionGroup: {id: oldReflectionGroupId},
      reflectionGroup: {id: newReflectionGroupId}
    } = payload

    updateColumnHeight(this.childrenCache, oldReflectionGroupId)
    if (oldReflectionGroupId !== newReflectionGroupId) {
      updateColumnHeight(this.childrenCache, newReflectionGroupId)
    }
    shakeUpBottomCells(this.childrenCache, this.parentCache.columnLefts)

    const {
      meeting: {reflectionGroups}
    } = this.props
    const reflectionGroup = reflectionGroups.find(
      (group) => group.reflectionGroupId === newReflectionGroupId
    )
    const [reflection] = reflectionGroup.reflections
    delete this.parentCache.cardsInFlight[reflection.reflectionId]
  }

  setItemRef = (childId) => (c) => {
    if (!c) return
    this.childrenCache[childId] = this.childrenCache[childId] || {}
    this.childrenCache[childId].itemEl = c
  }

  setChildRef = (childId, itemId) => (c) => {
    if (!c) return
    const childCache = this.childrenCache[childId]
    if (!childCache.el && !childCache.boundingBox) {
      const incomingChild = this.parentCache.incomingChildren[itemId]
      if (incomingChild) {
        const {boundingBox} = incomingChild
        if (incomingChild.childId) {
          // swap the coords with the previous placeholder
          childCache.boundingBox = this.childrenCache[incomingChild.childId].boundingBox
          delete this.childrenCache[incomingChild.childId]
        } else {
          // grab the coords from the incoming child
          childCache.boundingBox = boundingBox
          incomingChild.boundingBox = undefined
        }
        // not a huge mem leak since it can only grow to the size of reflections, but nice to keep clean
        if (isTempId(childId)) {
          incomingChild.childId = childId
        } else {
          delete this.parentCache.incomingChildren[itemId]
        }
        c.style.transform = `translate(${childCache.boundingBox.left}px, ${
          childCache.boundingBox.top
        }px)`
      }
    }
    childCache.el = c
  }

  setParentRef = (c) => {
    this.parentCache.el = c
  }

  render () {
    const {canDrop, connectDropTarget, meeting} = this.props
    const {reflectionGroups} = meeting
    return connectDropTarget(
      <div
        ref={this.setParentRef}
        className={gridStyle}
        style={{backgroundColor: canDrop && appTheme.palette.light70l}}
      >
        {reflectionGroups.map((reflectionGroup) => {
          const {reflectionGroupId, reflections} = reflectionGroup
          const [firstReflection] = reflections
          const reflectionId = firstReflection ? firstReflection.reflectionId : ''
          const childCache = this.childrenCache[reflectionGroupId]
          if (childCache && !childCache.boundingBox) return null
          return (
            <CardWrapper
              innerRef={this.setChildRef(reflectionGroupId, reflectionId)}
              key={reflectionGroupId}
            >
              <ReflectionGroup
                meeting={meeting}
                reflectionGroup={reflectionGroup}
                setInFlightCoords={this.setInFlightCoords}
                setItemRef={this.setItemRef(reflectionGroupId)}
              />
            </CardWrapper>
          )
        })}
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
    const updateLocation = () => {
      UpdateReflectionLocationMutation(atmosphere, variables, {meetingId}, onError, onCompleted)
    }
    return {dropTargetType: REFLECTION_GRID, updateLocation}
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
