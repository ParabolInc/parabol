import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {SpotlightGroups_meeting$key} from '~/__generated__/SpotlightGroups_meeting.graphql'
import {SpotlightGroups_viewer$key} from '~/__generated__/SpotlightGroups_viewer.graphql'
import SpotlightEmptyState from './SpotlightEmptyState'
import {useFragment} from 'react-relay'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import {useRef} from 'react'

const Container = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignContent: 'center',
  flexWrap: 'wrap'
})

interface Props {
  meeting: SpotlightGroups_meeting$key
  viewer: SpotlightGroups_viewer$key
}

const SpotlightGroups = (props: Props) => {
  const userData = useFragment(
    graphql`
      fragment SpotlightGroups_viewer on User {
        similarReflectionGroups(reflectionId: $reflectionId, searchQuery: $searchQuery) {
          id
          title
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
  const dummyRef = useRef(null) // TODO: either use it or make it optional in refGroups props

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
            phaseRef={dummyRef}
            reflectionGroup={reflectionGroup}
          />
        )
      })}
    </Container>
  )
}

export default SpotlightGroups
