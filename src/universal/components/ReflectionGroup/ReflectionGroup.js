// @flow
/* global HTMLElement, Node */

import * as React from 'react'
import styled from 'react-emotion'
import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard'
import {createFragmentContainer} from 'react-relay'
import type {ReflectionGroup_reflectionGroup as ReflectionGroupType} from './__generated__/ReflectionGroup_reflectionGroup.graphql'
import type {ReflectionGroup_meeting as Meeting} from './__generated__/ReflectionGroup_meeting.graphql'
import ui from 'universal/styles/ui'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import ReflectionGroupHeader from 'universal/components/ReflectionGroupHeader'
import {GROUP, REFLECTION_CARD, REFLECTION_GROUP, VOTE} from 'universal/utils/constants'
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard'
import {DropTarget as dropTarget} from 'react-dnd'
import UpdateReflectionLocationMutation from 'universal/mutations/UpdateReflectionLocationMutation'
import dndNoise from 'universal/utils/dndNoise'
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import withMutationProps from 'universal/utils/relay/withMutationProps'

const {Component} = React

export type Props = {|
  atmosphere: Object,
  canDrop: boolean,
  connectDropTarget: () => Node,
  innerRef?: (HTMLElement) => void,
  meeting: Meeting,
  reflectionGroup: ReflectionGroupType,
  retroPhaseItemId: string,
  ...MutationProps
|}

type State = {
  isExpanded: boolean
}

const MARGIN = 8

const Reflections = styled('div')(({canDrop}) => ({
  cursor: 'pointer',
  opacity: canDrop ? 0.6 : 1,
  position: 'relative'
}))

const ReflectionCardInStack = styled('div')({
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: ui.shadow[0],
  opacity: 1,
  position: 'absolute',
  left: 6,
  top: 6,
  right: -6,
  bottom: -2,
  zIndex: -1
})

const Group = styled('div')({
  padding: MARGIN
})

class ReflectionGroup extends Component<Props, State> {
  setReflectionListRef = (c) => {
    this.reflectionListRef = c
  }

  reflectionListRef: ?HTMLElement

  renderReflection = (reflection: Object, idx: number) => {
    const {setItemRef, setInFlightCoords, meeting, reflectionGroup, idx: groupIdx} = this.props
    const {
      reflections,
      retroPhaseItemId: currentRetroPhaseItemId,
      reflectionGroupId
    } = reflectionGroup
    const {
      localPhase: {phaseType}
    } = meeting

    if (idx > 0) {
      return (
        <ReflectionCardInStack key={reflection.id}>
          <ReflectionCard meeting={meeting} reflection={reflection} showOriginFooter />
        </ReflectionCardInStack>
      )
    }
    if (phaseType === GROUP) {
      return (
        <div key={reflection.id} ref={setItemRef}>
          <DraggableReflectionCard
            setInFlightCoords={setInFlightCoords}
            currentRetroPhaseItemId={currentRetroPhaseItemId}
            idx={groupIdx}
            meeting={meeting}
            reflection={reflection}
            isSingleCardGroup={reflections.length === 1}
            reflectionGroupId={reflectionGroupId}
          />
        </div>
      )
    }
    return (
      <div key={reflection.id} ref={this.setTopCardRef}>
        <ReflectionCard meeting={meeting} reflection={reflection} showOriginFooter />
      </div>
    )
  }

  render () {
    const {canDrop, connectDropTarget, meeting, reflectionGroup} = this.props
    if (!reflectionGroup) return null
    const {reflections} = reflectionGroup
    const {
      localPhase: {phaseType}
    } = meeting

    // the transform used to collapse cards results in a bad parent element height, which means overlapping groups
    const showHeader = reflections.length > 1 || phaseType === VOTE
    return (
      <Group innerRef={this.props.innerRef}>
        {showHeader && (
          <ReflectionGroupHeader meeting={meeting} reflectionGroup={reflectionGroup} />
        )}
        {/* connect the drop target here so dropping on the title triggers an ungroup */}
        {connectDropTarget(
          <div>
            <Reflections canDrop={canDrop} innerRef={this.setReflectionListRef}>
              {reflections.slice(0, 2).map(this.renderReflection)}
            </Reflections>
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

  // Makes the card-dropped-into available in the dragSpec's endDrag method.
  drop (props: Props, monitor) {
    if (monitor.didDrop()) return
    const {reflectionId} = monitor.getItem()
    const {
      atmosphere,
      meeting: {meetingId},
      onError,
      onCompleted,
      submitMutation,
      reflectionGroup
    } = props
    submitMutation()
    const {reflections, reflectionGroupId: targetReflectionGroupId} = reflectionGroup
    const [firstReflection] = reflections
    const variables = {
      reflectionId,
      reflectionGroupId: targetReflectionGroupId,
      sortOrder: firstReflection.sortOrder - 1 + dndNoise()
    }
    const updateLocation = () => {
      UpdateReflectionLocationMutation(atmosphere, variables, {meetingId}, onError, onCompleted)
    }
    return {dropTargetType: REFLECTION_GROUP, dropTargetId: targetReflectionGroupId, updateLocation}
    // TODO support intra-group drops
  }
}

const reflectionDropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  // isOver: monitor.isOver({shallow: true}),
  // item: monitor.getItem(),
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
      isExpanded
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
