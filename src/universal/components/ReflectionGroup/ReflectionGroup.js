// @flow
/* global HTMLElement, Node */

import * as React from 'react'
import styled from 'react-emotion'
import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import type {ReflectionGroup_reflectionGroup as ReflectionGroupType} from './__generated__/ReflectionGroup_reflectionGroup.graphql'
import type {ReflectionGroup_meeting as Meeting} from './__generated__/ReflectionGroup_meeting.graphql'
import ui from 'universal/styles/ui'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import ReflectionGroupHeader from 'universal/components/ReflectionGroupHeader'
import {GROUP, REFLECTION_CARD, VOTE} from 'universal/utils/constants'
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
  // '&::after': {
  //   content: '""',

  // }
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
  constructor (props) {
    super(props)
    const {
      atmosphere,
      reflectionGroup: {reflections, reflectionGroupId}
    } = props
    const isExpanded = reflections.length === 1
    // weird things happen without a set timeout, drag from group to column & it freezes?
    setTimeout(() => {
      commitLocalUpdate(atmosphere, (store) => {
        const reflectionGroupProxy = store.get(reflectionGroupId)
        if (reflectionGroupProxy) {
          reflectionGroupProxy.setValue(isExpanded, 'isExpanded')
        }
      })
    })
  }

  setTopCardRef = (c) => {
    this.topCardRef = c
  }

  setReflectionListRef = (c) => {
    this.reflectionListRef = c
  }

  reflectionListRef: ?HTMLElement
  topCardRef: ?HTMLElement

  toggleExpanded = () => {
    const {
      atmosphere,
      reflectionGroup: {reflections, reflectionGroupId}
    } = this.props
    if (reflections.length <= 1) return
    commitLocalUpdate(atmosphere, (store) => {
      const reflectionGroupProxy = store.get(reflectionGroupId)
      reflectionGroupProxy.setValue(!reflectionGroupProxy.getValue('isExpanded'), 'isExpanded')
    })
  }

  makeCustomHeight = () => {
    const {
      reflectionGroup: {reflections, isExpanded}
    } = this.props
    if (!this.topCardRef || !this.reflectionListRef || reflections.length <= 1 || isExpanded) {
      return {}
    }
    const groupTop = this.reflectionListRef.getBoundingClientRect().top
    // $FlowFixMe
    const {top, height} = this.topCardRef.getBoundingClientRect()
    const groupBottom = top + height
    return {height: groupBottom - groupTop}
  }

  renderReflection = (reflection: Object, idx: number) => {
    const {meeting, reflectionGroup} = this.props
    const {reflections, retroPhaseItemId: currentRetroPhaseItemId} = reflectionGroup
    const {
      localPhase: {phaseType}
    } = meeting
    // const isTopCard = idx === reflections.length - 1
    // const isCollapsed = isExpanded ? false : !isTopCard
    // const showOriginFooter = retroPhaseItemId !== reflection.retroPhaseItemId
    // const interval = reflections.length - idx - 1
    //
    // const yTranslate = -idx * ui.retroCardCollapsedHeightRem
    // const style = {
    //   transform:
    //     !isExpanded &&
    //     `translateY(${yTranslate}rem)
    //    scale(${1 - 0.05 * interval})`,
    //   transitionDelay: isExpanded ? `${20 * interval}ms` : `${10 * idx}ms`,
    //   transition: !canDrop && 'all 200ms ease'
    // }

    // const onTransitionEnd = () => {
    //   // wait for the topCard to find its new home before calculating the height
    //   if (isExpanded || !this.topCardRef || !this.reflectionListRef || reflections.length <= 1) {
    //     return
    //   }
    //   this.forceUpdate()
    // }
    if (idx > 0) {
      return (
        <ReflectionCardInStack key={reflection.id}>
          <ReflectionCard meeting={meeting} reflection={reflection} showOriginFooter />
        </ReflectionCardInStack>
      )
    }
    if (phaseType === GROUP) {
      return (
        <div
          key={reflection.id}
          // style={style}
          ref={this.setTopCardRef}
        >
          <DraggableReflectionCard
            currentRetroPhaseItemId={currentRetroPhaseItemId}
            dndIndex={idx}
            meeting={meeting}
            reflection={reflection}
            isSingleCardGroup={reflections.length === 1}
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
    return monitor.isOver()
  },

  // Makes the card-dropped-into available in the dragSpec's endDrag method.
  drop (props: Props, monitor) {
    if (monitor.didDrop()) return
    const {reflectionId, reflectionGroupId: sourceReflectionGroupId} = monitor.getItem()
    const {
      atmosphere,
      meeting: {meetingId},
      onError,
      onCompleted,
      submitMutation,
      reflectionGroup
    } = props
    const {reflections, reflectionGroupId: targetReflectionGroupId} = reflectionGroup
    if (sourceReflectionGroupId === targetReflectionGroupId) {
      // changing the sort order within the group
    } else {
      const lastReflection = reflections[reflections.length - 1]
      const variables = {
        reflectionId,
        reflectionGroupId: targetReflectionGroupId,
        sortOrder: lastReflection.sortOrder + 1 + dndNoise()
      }
      submitMutation()
      UpdateReflectionLocationMutation(atmosphere, variables, {meetingId}, onError, onCompleted)
    }
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
