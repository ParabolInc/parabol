import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject} from 'react'
import SpotlightGroupsEmptyState from './SpotlightGroupsEmptyState'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import {Breakpoint, ElementWidth} from '~/types/constEnums'
import useBreakpoint from '~/hooks/useBreakpoint'
import {SpotlightGroupsQuery} from '~/__generated__/SpotlightGroupsQuery.graphql'
import {SPOTLIGHT_TOP_SECTION_HEIGHT} from '~/utils/constants'
import useGroupMatrix from '../hooks/useGroupMatrix'

const SimilarGroups = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  height: `calc(100% - ${SPOTLIGHT_TOP_SECTION_HEIGHT}px)`,
  width: '100%',
  display: 'flex',
  padding: `${isDesktop ? '40px' : '32px'} 0px 24px`
}))

const Scrollbar = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  overflow: 'auto',
  height: '100%',
  width: '100%'
})

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
            spotlightColumnIdx
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
  const groupMatrix = useGroupMatrix(similarReflectionGroups, resultsRef)
  const isDesktop = useBreakpoint(Breakpoint.FUZZY_TABLET)

  if (!similarReflectionGroups.length) return <SpotlightGroupsEmptyState />
  return (
    <SimilarGroups isDesktop={isDesktop}>
      <Scrollbar>
        <ColumnsWrapper ref={resultsRef}>
          {groupMatrix?.map((row) => (
            <Column key={`${row[0].id}-${row[0].spotlightColumnIdx}`}>
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
