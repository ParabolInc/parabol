import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Suspense, useRef} from 'react'
import {ElementHeight, ElementWidth, ZIndex} from '../types/constEnums'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import SpotlightGroups from './SpotlightGroups'
import LoadingComponent from './LoadingComponent/LoadingComponent'
import {
  SpotlightResultsRootQuery
} from '../__generated__/SpotlightResultsRootQuery.graphql'
import DraggableReflectionCard from './ReflectionGroup/DraggableReflectionCard'

const SELECTED_HEIGHT_PERC = 33.3
const SimilarGroups = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: `${SELECTED_HEIGHT_PERC * 2}%`,
  padding: 16
})

const ReflectionWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  top: `calc(${SELECTED_HEIGHT_PERC / 2}% - ${ElementHeight.REFLECTION_CARD / 2}px)`,
  left: `calc(50% - ${ElementWidth.REFLECTION_CARD / 2}px)`,
  zIndex: ZIndex.REFLECTION_IN_FLIGHT_LOCAL
})

interface Props {
  flipRef: (instance: HTMLDivElement) => void
  queryRef: PreloadedQuery<SpotlightResultsRootQuery>
}

const SpotlightResultsRoot = (props: Props) => {
  const {flipRef, queryRef} = props
  const data = usePreloadedQuery<SpotlightResultsRootQuery>(
    graphql`
      query SpotlightResultsRootQuery($reflectionId: ID!, $searchQuery: String!, $meetingId: ID!) {
        viewer {
          ...SpotlightGroups_viewer
          meeting(meetingId: $meetingId) {
            ... on RetrospectiveMeeting {
              ...DraggableReflectionCard_meeting
              ...SpotlightGroups_meeting
              id
              teamId
              localPhase {
                phaseType
              }
              localStage {
                isComplete
                phaseType
              }
              phases {
                phaseType
                stages {
                  isComplete
                  phaseType
                }
              }
              spotlightReflection {
                ...DraggableReflectionCard_reflection
              }
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
  const phaseRef = useRef(null)

  if (!meeting) return null
  const {spotlightReflection} = meeting
  return (
    <>
      <SimilarGroups>
        <Suspense
          fallback={<LoadingComponent height={24} width={24} showAfter={0} spinnerSize={24} />}
        >
          <SpotlightGroups meeting={meeting} phaseRef={phaseRef} viewer={viewer} />
        </Suspense>
      </SimilarGroups>
      <ReflectionWrapper ref={flipRef}>
        {spotlightReflection && (
          <DraggableReflectionCard
            isDraggable
            reflection={spotlightReflection}
            meeting={meeting}
            staticReflections={null}
          />
        )}
      </ReflectionWrapper>
    </>
  )
}

export default SpotlightResultsRoot
