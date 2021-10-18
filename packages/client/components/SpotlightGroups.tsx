import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useRef} from 'react'
import SpotlightGroupsEmptyState from './SpotlightGroupsEmptyState'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import {ElementWidth} from '~/types/constEnums'
import {SpotlightGroupsQuery} from '~/__generated__/SpotlightGroupsQuery.graphql'
import useGroupMatrix from '../hooks/useGroupMatrix'
import useGetRefVal from '../hooks/useGetRefVal'
import {SPOTLIGHT_TOP_SECTION_HEIGHT} from '~/utils/constants'

const SimilarGroups = styled('div')({
  width: '100%',
  display: 'flex',
  padding: '40px 0px 24px',
  maxHeight: `calc(90vh - ${SPOTLIGHT_TOP_SECTION_HEIGHT}px)`
})

const Scrollbar = styled('div')<{height: number | null}>(({height}) => ({
  display: 'flex',
  justifyContent: 'center',
  overflow: 'auto',
  // if results are remotely ungrouped, SpotlightGroups increases in height.
  // to prevent the groups height from changing, use initial scroll height
  maxHeight: height || '100%',
  width: '100%'
}))

const ColumnsWrapper = styled('div')({
  display: 'flex',
  height: 'fit-content',
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
      query SpotlightGroupsQuery($reflectionId: ID!, $searchQuery: String!, $meetingId: ID!) {
        viewer {
          similarReflectionGroups(reflectionId: $reflectionId, searchQuery: $searchQuery) {
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
              spotlightReflection {
                id
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
  const {meeting, similarReflectionGroups} = viewer
  const groupMatrix = useGroupMatrix(similarReflectionGroups, resultsRef, phaseRef)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollHeight = useGetRefVal(scrollRef, 'clientHeight')

  if (!similarReflectionGroups.length) return <SpotlightGroupsEmptyState />
  return (
    <SimilarGroups>
      <Scrollbar ref={scrollRef} height={scrollHeight}>
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
