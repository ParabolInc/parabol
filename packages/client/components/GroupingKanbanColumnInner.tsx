import React, {memo} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {GroupingKanbanColumnInner_reflectionGroups} from '__generated__/GroupingKanbanColumnInner_reflectionGroups.graphql'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import { GroupingKanbanColumnInner_meeting } from '__generated__/GroupingKanbanColumnInner_meeting.graphql';


interface Props {
  meeting: GroupingKanbanColumnInner_meeting
  reflectionGroups: GroupingKanbanColumnInner_reflectionGroups
}

const GroupingKanbanColumnInner = memo((props: Props) => {
  const {meeting, reflectionGroups} = props
  let startIdx = 0
  return reflectionGroups.map((reflectionGroup) => {
    const idx = startIdx
    startIdx += reflectionGroup.reflections.length
    return <ReflectionGroup key={reflectionGroup.id} meeting={meeting} reflectionGroup={reflectionGroup} startIdx={idx}/>
  }) as any
})

export default createFragmentContainer(
  GroupingKanbanColumnInner,
  {
    reflectionGroups: graphql`
      fragment GroupingKanbanColumnInner_reflectionGroups on RetroReflectionGroup @relay(plural: true) {
        ...ReflectionGroup_reflectionGroup
        id
        reflections {
          id
        }
      }
    `,
    meeting: graphql`
    fragment GroupingKanbanColumnInner_meeting on RetrospectiveMeeting {
      ...ReflectionGroup_meeting
    }`
  }
)
