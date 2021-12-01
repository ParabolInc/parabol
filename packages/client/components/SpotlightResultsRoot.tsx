import React, {RefObject, Suspense, useRef} from 'react'
import graphql from 'babel-plugin-relay/macro'
import spotlightGroupsQuery, {
  SpotlightGroupsQuery
} from '../__generated__/SpotlightGroupsQuery.graphql'
import SpotlightGroups from './SpotlightGroups'
import useQueryLoaderNow from '~/hooks/useQueryLoaderNow'
import {SpotlightResultsRoot_meeting$key} from '../__generated__/SpotlightResultsRoot_meeting.graphql'
import {useFragment} from 'react-relay'

interface Props {
  meetingRef: SpotlightResultsRoot_meeting$key
  phaseRef: RefObject<HTMLDivElement>
  isSpotlightEntering: boolean
}

const SpotlightResultsRoot = (props: Props) => {
  const {meetingRef, phaseRef, isSpotlightEntering} = props
  const meeting = useFragment(
    graphql`
      fragment SpotlightResultsRoot_meeting on RetrospectiveMeeting {
        id
        spotlightGroup {
          id
        }
        spotlightSearchQuery
      }
    `,
    meetingRef
  )
  const {id: meetingId, spotlightGroup, spotlightSearchQuery} = meeting
  const spotlightGroupId = spotlightGroup?.id
  const groupIdRef = useRef('')
  const nextGroupId = spotlightGroupId ?? ''
  if (nextGroupId) {
    groupIdRef.current = nextGroupId
  }
  const variables = {
    reflectionGroupId: groupIdRef.current,
    searchQuery: spotlightSearchQuery ?? '',
    meetingId
  }
  const queryRef = useQueryLoaderNow<SpotlightGroupsQuery>(
    spotlightGroupsQuery,
    variables,
    undefined,
    true
  )

  return (
    <Suspense fallback={''}>
      {queryRef && (
        <SpotlightGroups
          phaseRef={phaseRef}
          queryRef={queryRef}
          isSpotlightEntering={isSpotlightEntering}
        />
      )}
    </Suspense>
  )
}
export default SpotlightResultsRoot
