import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject} from 'react'
import {SpotlightGroups_meeting$key} from '~/__generated__/SpotlightGroups_meeting.graphql'
import {SpotlightGroups_viewer$key} from '~/__generated__/SpotlightGroups_viewer.graphql'
import SpotlightGroupsEmptyState from './SpotlightGroupsEmptyState'
import {useFragment} from 'react-relay'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import useSpotlightColumns from '../hooks/useSpotlightColumns'
import useSortGroupsIntoColumns from '../hooks/useSortGroupsIntoColumns'
import {Breakpoint, ElementWidth} from '~/types/constEnums'
import useBreakpoint from '~/hooks/useBreakpoint'
import {SPOTLIGHT_TOP_SECTION_HEIGHT} from '~/utils/constants'

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
  meeting: SpotlightGroups_meeting$key
  columnsRef: RefObject<HTMLDivElement>
  phaseRef: RefObject<HTMLDivElement>
  viewer: SpotlightGroups_viewer$key
}

const SpotlightGroups = (props: Props) => {
  const {columnsRef, phaseRef} = props
  const userData = useFragment(
    graphql`
      fragment SpotlightGroups_viewer on User {
        similarReflectionGroups(reflectionId: $reflectionId, searchQuery: $searchQuery) {
          id
          spotlightColumnIdx
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
  const groupsCount = similarReflectionGroups.length
  const columns = useSpotlightColumns(columnsRef, groupsCount)
  useSortGroupsIntoColumns(similarReflectionGroups, columns)
  const isDesktop = useBreakpoint(Breakpoint.FUZZY_TABLET)

  if (!groupsCount) return <SpotlightGroupsEmptyState />
  return (
    <SimilarGroups isDesktop={isDesktop}>
      <Scrollbar>
        <ColumnsWrapper ref={columnsRef}>
          {columns?.map((columnIdx) => (
            <Column key={columnIdx}>
              {similarReflectionGroups.map((reflectionGroup) => {
                if (reflectionGroup.spotlightColumnIdx !== columnIdx) return null
                return (
                  <ReflectionGroup
                    key={reflectionGroup.id}
                    meeting={meetingData}
                    phaseRef={phaseRef}
                    reflectionGroup={reflectionGroup}
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
