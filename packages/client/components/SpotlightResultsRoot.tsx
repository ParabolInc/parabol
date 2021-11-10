import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, Suspense} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import SpotlightGroups from './SpotlightGroups'
import {
  SpotlightResultsRootQuery
} from '../__generated__/SpotlightResultsRootQuery.graphql'

interface Props {
  queryRef: PreloadedQuery<SpotlightResultsRootQuery>
  phaseRef: RefObject<HTMLDivElement>
}

const SpotlightResultsRoot = (props: Props) => {
  const {queryRef, phaseRef} = props
  const data = usePreloadedQuery<SpotlightResultsRootQuery>(
    graphql`
      query SpotlightResultsRootQuery($reflectionGroupId: ID!, $searchQuery: String!, $meetingId: ID!) {
        viewer {
          ...SpotlightGroups_viewer
          meeting(meetingId: $meetingId) {
            ...SpotlightGroups_meeting
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const {viewer} = data
  const meeting = viewer.meeting!

  return (
    <Suspense fallback={''}>
      <SpotlightGroups meeting={meeting} phaseRef={phaseRef} viewer={viewer} />
    </Suspense>
  )
}

export default SpotlightResultsRoot
