import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject} from 'react'
import SpotlightGroupsEmptyState from './SpotlightGroupsEmptyState'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import {ElementWidth} from '~/types/constEnums'
import {SpotlightGroupsQuery} from '~/__generated__/SpotlightGroupsQuery.graphql'
import useGroupMatrix from '../hooks/useGroupMatrix'
import {SPOTLIGHT_TOP_SECTION_HEIGHT} from '~/utils/constants'

const SimilarGroups = styled('div')({
  width: '100%',
  padding: '40px 0px 24px',
  height: `calc(100% - ${SPOTLIGHT_TOP_SECTION_HEIGHT}px)`
})

const Scrollbar = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  overflow: 'auto',
  height: '100%',
  width: '100%'
})

const ColumnsWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  width: '100%'
})

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

  if (!similarReflectionGroups.length) return <SpotlightGroupsEmptyState resultsRef={resultsRef} />
  return (
    <SimilarGroups>
      <Scrollbar>
        <ColumnsWrapper ref={resultsRef}>
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
        </ColumnsWrapper>
      </Scrollbar>
    </SimilarGroups>
  )
}

export default SpotlightGroups
