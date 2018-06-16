// @flow
/* global HTMLElement, Node */

import * as React from 'react'
import styled, {css} from 'react-emotion'
import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard'
import {createFragmentContainer} from 'react-relay'
import type {ReflectionGroup_reflectionGroup as ReflectionGroupType} from './__generated__/ReflectionGroup_reflectionGroup.graphql'
import type {ReflectionGroup_meeting as Meeting} from './__generated__/ReflectionGroup_meeting.graphql'
import ui from 'universal/styles/ui'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import ReflectionGroupHeader from 'universal/components/ReflectionGroupHeader'
import {REFLECTION_CARD, REFLECTION_GROUP, VOTE} from 'universal/utils/constants'
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard'
import {DropTarget as dropTarget} from '@mattkrick/react-dnd'
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {CARD_PADDING} from 'universal/utils/multiplayerMasonry/masonryConstants'

const {Component} = React

export type Props = {|
  atmosphere: Object,
  canDrop: boolean,
  connectDropTarget: () => Node,
  meeting: Meeting,
  reflectionGroup: ReflectionGroupType,
  retroPhaseItemId: string,
  ...MutationProps
|}

type State = {
  isExpanded: boolean
}

const reflectionsStyle = (canDrop) =>
  css({
    cursor: 'pointer',
    opacity: canDrop ? 0.6 : 1,
    position: 'relative'
  })

const ReflectionCardInStack = styled('div')({
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: ui.shadow[0],
  opacity: 1,
  overflow: 'hidden',
  position: 'absolute',
  left: 6,
  top: 6,
  right: -6,
  bottom: -2,
  zIndex: -1
})

const Group = styled('div')({
  padding: CARD_PADDING
})

class ReflectionGroup extends Component<Props, State> {
  renderReflection = (reflection: Object, idx: number) => {
    const {setItemRef, meeting, reflectionGroup} = this.props
    const {reflections} = reflectionGroup

    if (idx > 0) {
      return (
        <ReflectionCardInStack key={reflection.id}>
          <ReflectionCard meeting={meeting} reflection={reflection} showOriginFooter hideShadow />
        </ReflectionCardInStack>
      )
    }
    return (
      <div key={reflection.id} ref={setItemRef}>
        <DraggableReflectionCard
          meeting={meeting}
          reflection={reflection}
          isSingleCardGroup={reflections.length === 1}
        />
      </div>
    )
  }

  render () {
    const {canDrop, connectDropTarget, meeting, reflectionGroup} = this.props
    const {reflections} = reflectionGroup
    const {
      localPhase: {phaseType}
    } = meeting
    const showHeader = reflections.length > 1 || phaseType === VOTE
    return (
      <Group>
        {showHeader && (
          <ReflectionGroupHeader meeting={meeting} reflectionGroup={reflectionGroup} />
        )}
        {/* connect the drop target here so dropping on the title triggers an ungroup */}
        {connectDropTarget(
          <div className={reflectionsStyle(canDrop)}>
            {reflections.slice(0, 2).map(this.renderReflection)}
          </div>
        )}
      </Group>
    )
  }
}

const reflectionDropSpec = {
  canDrop (props: Props, monitor) {
    return (
      monitor.isOver() &&
      monitor.getItem().reflectionGroupId !== props.reflectionGroup.reflectionGroupId
    )
  },

  drop (props: Props, monitor) {
    if (monitor.didDrop()) return
    const {reflectionGroup} = props
    const {reflectionGroupId: targetReflectionGroupId} = reflectionGroup
    return {dropTargetType: REFLECTION_GROUP, dropTargetId: targetReflectionGroupId}
  }
}

const reflectionDropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: monitor.canDrop()
})

export default createFragmentContainer(
  withAtmosphere(
    withMutationProps(
      dropTarget(REFLECTION_CARD, reflectionDropSpec, reflectionDropCollect)(ReflectionGroup)
    )
  ),
  graphql`
    fragment ReflectionGroup_meeting on RetrospectiveMeeting {
      meetingId: id
      ...ReflectionCard_meeting
      ...ReflectionGroupHeader_meeting
      localPhase {
        phaseType
      }
    }

    fragment ReflectionGroup_reflectionGroup on RetroReflectionGroup {
      ...ReflectionGroupHeader_reflectionGroup
      retroPhaseItemId
      reflectionGroupId: id
      sortOrder
      reflections {
        id
        retroPhaseItemId
        sortOrder
        ...DraggableReflectionCard_reflection
        ...ReflectionCard_reflection
      }
    }
  `
)
