import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, Suspense} from 'react'
import {Spotlight} from '../types/constEnums'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import SpotlightGroups from './SpotlightGroups'
import LoadingComponent from './LoadingComponent/LoadingComponent'
import {
  SpotlightResultsRootQuery
} from '../__generated__/SpotlightResultsRootQuery.graphql'

const SimilarGroups = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: `${Spotlight.SELECTED_HEIGHT_PERC * 2}%`,
  padding: 16
})

interface Props {
  queryRef: PreloadedQuery<SpotlightResultsRootQuery>
  phaseRef: RefObject<HTMLDivElement>
}

const SpotlightResultsRoot = (props: Props) => {
  const {queryRef, phaseRef} = props
  const data = usePreloadedQuery<SpotlightResultsRootQuery>(
    graphql`
      query SpotlightResultsRootQuery($reflectionId: ID!, $searchQuery: String!, $meetingId: ID!) {
        viewer {
          ...SpotlightGroups_viewer
          meeting(meetingId: $meetingId) {
            ... on RetrospectiveMeeting {
              ...SpotlightGroups_meeting
            }
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const {viewer} = data
  const {meeting} = viewer

  if (!meeting) return null
  return (
    <SimilarGroups>
      <Suspense
        fallback={<LoadingComponent height={24} width={24} showAfter={0} spinnerSize={24} />}
      >
        <SpotlightGroups meeting={meeting} phaseRef={phaseRef} viewer={viewer} />
      </Suspense>
    </SimilarGroups>
  )
}

export default SpotlightResultsRoot
