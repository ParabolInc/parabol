import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useRef} from 'react'
import {SpotlightGroups_meeting$key} from '~/__generated__/SpotlightGroups_meeting.graphql'
import {SpotlightGroups_viewer$key} from '~/__generated__/SpotlightGroups_viewer.graphql'
import SpotlightGroupsEmptyState from './SpotlightGroupsEmptyState'
import {useFragment} from 'react-relay'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import useSpotlightColumns from '../hooks/useSpotlightColumns'
import useGroupsByColumn from '../hooks/useGroupsByColumn'
import {ElementWidth} from '~/types/constEnums'

const Container = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignContent: 'center',
  flexWrap: 'wrap',
  width: '100%',
  height: '100%',
  padding: '64px 24px'
})

const Scrollbar = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  overflow: 'auto',
  height: '100%',
  width: '100%'
})

const Column = styled('div')({
  display: 'flex',
  maxWidth: ElementWidth.MEETING_CARD,
  margin: '0 8px',
  flexDirection: 'column',
  height: '100%'
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
          spotlightColumnIdx
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
  const groupsRef = useRef(null)
  const columns = useSpotlightColumns(groupsRef)
  useGroupsByColumn(similarReflectionGroups, columns)

  if (!similarReflectionGroups.length) {
    return <SpotlightGroupsEmptyState />
  }
  return (
    <Container ref={groupsRef}>
      <Scrollbar>
        {columns?.map((columnIdx) => (
          <Column key={columnIdx}>
            {similarReflectionGroups.map((reflectionGroup) => {
              if (reflectionGroup.spotlightColumnIdx !== columnIdx) return null
              return (
                <ReflectionGroup
                  key={reflectionGroup.id}
                  meeting={meetingData}
                  phaseRef={phaseRef}
                  reflectionGroup={reflectionGroup}
                />
              )
            })}
          </Column>
        ))}
      </Scrollbar>
    </Container>
  )
}

export default SpotlightGroups
