import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useRef} from 'react'
import {useFragment} from 'react-relay'
import {SpotlightGroups_meeting$key} from '~/__generated__/SpotlightGroups_meeting.graphql'
import {SpotlightGroups_viewer$key} from '~/__generated__/SpotlightGroups_viewer.graphql'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import {ElementHeight, ElementWidth} from '~/types/constEnums'
import useGroupMatrix from '../hooks/useGroupMatrix'
import useResultsHeight from '~/hooks/useResultsHeight'
import SpotlightGroupsEmptyState from './SpotlightGroupsEmptyState'

const SimilarGroups = styled('div')({
  padding: '40px 0px 24px',
  height: '100%',
  width: '100%',
  overflow: 'hidden'
})

const Scrollbar = styled('div')<{height: number | string}>(({height}) => ({
  display: 'flex',
  justifyContent: 'center',
  overflow: 'auto',
  width: '100%',
  height,
  minHeight: ElementHeight.REFLECTION_CARD * 4
}))

const Column = styled('div')({
  display: 'flex',
  maxWidth: ElementWidth.REFLECTION_COLUMN,
  margin: '0 8px',
  flexDirection: 'column',
  height: 'fit-content'
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
        similarReflectionGroups(reflectionGroupId: $reflectionGroupId, searchQuery: $searchQuery) {
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
  const resultsRef = useRef<HTMLDivElement>(null)
  const groupMatrix = useGroupMatrix(similarReflectionGroups, resultsRef, phaseRef)
  const scrollHeight = useResultsHeight(resultsRef)

  if (!similarReflectionGroups.length) return <SpotlightGroupsEmptyState />
  return (
    <SimilarGroups>
      <Scrollbar height={scrollHeight} ref={resultsRef}>
        {groupMatrix.map((row) => (
          <Column key={`row-${row[0].id}`}>
            {row.map((group) => (
              <ReflectionGroup
                key={group.id}
                meeting={meetingData}
                phaseRef={phaseRef}
                reflectionGroup={group}
                expandedReflectionGroupPortalParentId='spotlight'
              />
            ))}
          </Column>
        ))}
      </Scrollbar>
    </SimilarGroups>
  )
}

export default SpotlightGroups
