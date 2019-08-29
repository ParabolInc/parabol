import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {GroupingKanbanColumn_reflectionGroups} from '__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import {GroupingKanbanColumn_meeting} from '__generated__/GroupingKanbanColumn_meeting.graphql'
import {BezierCurve} from '../types/constEnums'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'
import {GroupingKanbanColumn_prompt} from '__generated__/GroupingKanbanColumn_prompt.graphql'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'

// TODO share with TaskColumn
const Column = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  position: 'relative',
  transition: `background 300ms ${BezierCurve.DECELERATE}`
})

const ColumnHeader = styled('div')({
  color: PALETTE.TEXT_MAIN,
  display: 'flex',
  lineHeight: '24px'
})

const ColumnBody = styled('div')({
  flex: 1,
  height: '100%',
  // overflowX: 'hidden',
  // overflowY: 'auto',
  minHeight: 200,
  paddingBottom: 8,
  width: 'fit-content'
})

interface Props {
  meeting: GroupingKanbanColumn_meeting
  prompt: GroupingKanbanColumn_prompt
  reflectionGroups: GroupingKanbanColumn_reflectionGroups
}

const GroupingKanbanColumn = (props: Props) => {
  const {meeting, reflectionGroups, prompt} = props
  const {title} = prompt
  return (
    <Column>
      <ColumnHeader>
        <Icon>add</Icon>
        {title}
        {reflectionGroups.length || null}
      </ColumnHeader>
      <ColumnBody>
        {reflectionGroups.map((reflectionGroup) => {
          return <ReflectionGroup key={reflectionGroup.id} meeting={meeting} reflectionGroup={reflectionGroup} />
        })}
      </ColumnBody>
    </Column>
  )
}

export default createFragmentContainer(
  GroupingKanbanColumn,
  {
    meeting: graphql`
      fragment GroupingKanbanColumn_meeting on RetrospectiveMeeting {
        ...ReflectionGroup_meeting
      }`,
    reflectionGroups: graphql`
      fragment GroupingKanbanColumn_reflectionGroups on RetroReflectionGroup @relay(plural: true) {
        ...ReflectionGroup_reflectionGroup
        id
        reflections {
          id
        }
      }`,
    prompt: graphql`
      fragment GroupingKanbanColumn_prompt on RetroPhaseItem {
        id
        title
      }`
  }
)
