import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject} from 'react'
import SpotlightGroupsEmptyState from './SpotlightGroupsEmptyState'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import {ElementHeight, ElementWidth} from '~/types/constEnums'
import {SpotlightGroupsQuery} from '~/__generated__/SpotlightGroupsQuery.graphql'
import useGroupMatrix from '../hooks/useGroupMatrix'
import useResultsHeight from '~/hooks/useResultsHeight'

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
  // wait for height to be calculated before setting the minHeight
  minHeight: height === '100%' ? undefined : ElementHeight.REFLECTION_CARD * 4
}))

const Column = styled('div')({
  display: 'flex',
  maxWidth: ElementWidth.REFLECTION_COLUMN,
  margin: '0 8px',
  flexDirection: 'column',
  height: 'fit-content'
})

interface Props {
  resultsRef: RefObject<HTMLDivElement>
  phaseRef: RefObject<HTMLDivElement>
  queryRef: PreloadedQuery<SpotlightGroupsQuery>
}

const SpotlightGroups = (props: Props) => {
  const {resultsRef, phaseRef, queryRef} = props
  const data = usePreloadedQuery<SpotlightGroupsQuery>(
    graphql`
      query SpotlightGroupsQuery($reflectionGroupId: ID!, $searchQuery: String!, $meetingId: ID!) {
        viewer {
          similarReflectionGroups(
            reflectionGroupId: $reflectionGroupId
            searchQuery: $searchQuery
          ) {
            id
            ...ReflectionGroup_reflectionGroup
          }
          meeting(meetingId: $meetingId) {
            ... on RetrospectiveMeeting {
              ...DraggableReflectionCard_meeting
              ...ReflectionGroup_meeting
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
              spotlightGroup {
                id
                ...ReflectionGroup_reflectionGroup
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
  const {meeting, similarReflectionGroups} = viewer
  const groupMatrix = useGroupMatrix(similarReflectionGroups, resultsRef, phaseRef)
  const scrollHeight = useResultsHeight(resultsRef)

  if (!similarReflectionGroups.length) return <SpotlightGroupsEmptyState resultsRef={resultsRef} />
  return (
    <SimilarGroups>
      <Scrollbar height={scrollHeight} ref={resultsRef}>
        {groupMatrix?.map((row) => (
          <Column key={`${row[0].id}-${row[0].id}`}>
            {row.map((group) => {
              return (
                <ReflectionGroup
                  key={group.id}
                  meeting={meeting!}
                  phaseRef={phaseRef}
                  reflectionGroup={group}
                />
              )
            })}
          </Column>
        ))}
      </Scrollbar>
    </SimilarGroups>
  )
}

export default SpotlightGroups
