import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useRef} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useResultsHeight from '~/hooks/useResultsHeight'
import {ElementHeight, ElementWidth} from '~/types/constEnums'
import {SpotlightResultsQuery} from '~/__generated__/SpotlightResultsQuery.graphql'
import useGroupMatrix from '../hooks/useGroupMatrix'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import SpotlightResultsEmptyState from './SpotlightResultsEmptyState'

const ResultsWrapper = styled('div')({
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
  phaseRef: RefObject<HTMLDivElement>
  queryRef: PreloadedQuery<SpotlightResultsQuery>
  isSpotlightEntering: boolean
}

const SpotlightResults = (props: Props) => {
  const {phaseRef, queryRef, isSpotlightEntering} = props

  const data = usePreloadedQuery<SpotlightResultsQuery>(
    graphql`
      query SpotlightResultsQuery($reflectionGroupId: ID!, $searchQuery: String!, $meetingId: ID!) {
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
    queryRef
  )
  const {viewer} = data
  const {meeting, similarReflectionGroups} = viewer
  const resultsRef = useRef<HTMLDivElement>(null)
  const groupMatrix = useGroupMatrix(similarReflectionGroups, resultsRef, phaseRef)
  const scrollHeight = useResultsHeight(resultsRef)

  return (
    <ResultsWrapper>
      {!similarReflectionGroups.length ? (
        <SpotlightResultsEmptyState height={scrollHeight} />
      ) : (
        <Scrollbar height={scrollHeight} ref={resultsRef}>
          {groupMatrix.map((row) => (
            <Column key={`row-${row[0]?.id}`}>
              {row.map((group) => (
                <ReflectionGroup
                  key={group.id}
                  meetingRef={meeting!}
                  phaseRef={phaseRef}
                  reflectionGroupRef={group}
                  expandedReflectionGroupPortalParentId='spotlight'
                  isSpotlightEntering={isSpotlightEntering}
                />
              ))}
            </Column>
          ))}
        </Scrollbar>
      )}
    </ResultsWrapper>
  )
}

export default SpotlightResults
