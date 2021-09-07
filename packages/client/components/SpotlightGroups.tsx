import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject} from 'react'
import {SpotlightGroups_meeting$key} from '~/__generated__/SpotlightGroups_meeting.graphql'
import {SpotlightGroups_viewer$key} from '~/__generated__/SpotlightGroups_viewer.graphql'
import SpotlightEmptyState from './SpotlightEmptyState'
import {useFragment} from 'react-relay'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'

const Container = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignContent: 'center',
  flexWrap: 'wrap'
})

interface Props {
  meeting: SpotlightGroups_meeting$key
  phaseRef: RefObject<HTMLDivElement>
  viewer: SpotlightGroups_viewer$key
}

const SpotlightGroups = (props: Props) => {
  const {phaseRef} = props
  const userData = useFragment(
    graphql`
      fragment SpotlightGroups_viewer on User {
        similarReflectionGroups(reflectionId: $reflectionId, searchQuery: $searchQuery) {
          id
          ...ReflectionGroup_reflectionGroup
        }
        meeting(meetingId: $meetingId) {
          ...SpotlightGroups_meeting
        }
      }
    `,
    props.viewer
  )
  const meetingData = useFragment(
    graphql`
      fragment SpotlightGroups_meeting on RetrospectiveMeeting {
        ...ReflectionGroup_meeting
      }
    `,
    props.meeting
  )
  const {similarReflectionGroups} = userData

  if (!similarReflectionGroups.length) {
    return <SpotlightEmptyState />
  }
  return (
    <Container>
      {similarReflectionGroups.map((reflectionGroup) => {
        return (
          <ReflectionGroup
            key={reflectionGroup.id}
            meeting={meetingData}
            phaseRef={phaseRef}
            reflectionGroup={reflectionGroup}
          />
        )
      })}
    </Container>
  )
}

export default SpotlightGroups
