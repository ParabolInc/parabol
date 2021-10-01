import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useRef} from 'react'
import {SpotlightGroups_meeting$key} from '~/__generated__/SpotlightGroups_meeting.graphql'
import {SpotlightGroups_viewer$key} from '~/__generated__/SpotlightGroups_viewer.graphql'
import SpotlightGroupsEmptyState from './SpotlightGroupsEmptyState'
import {useFragment} from 'react-relay'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import useSpotlightColumns from '../hooks/useSpotlightColumns'
import useSortGroupsIntoColumns from '../hooks/useSortGroupsIntoColumns'
import {ElementWidth} from '~/types/constEnums'
import useSpotlightGroupsHeight from '../hooks/useSpotlightGroupsHeight'

export const MAX_GROUPS_HEIGHT_PERC = 66.6

const SimilarGroups = styled('div')<{height: number | string}>(({height}) => ({
  maxHeight: `${MAX_GROUPS_HEIGHT_PERC}%`,
  height,
  width: '100%',
  display: 'flex',
  padding: '48px 0px 24px 0px',
  border: '2px solid red'
}))

const Scrollbar = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  overflow: 'auto',
  height: '100%',
  width: '100%',
  border: '2px solid blue'
})

const ColumnsWrapper = styled('div')({
  display: 'flex',
  width: '100%',
  height: 'fit-content',
  justifyContent: 'center',
  border: '2px solid pink'
})

const Column = styled('div')({
  display: 'flex',
  maxWidth: ElementWidth.REFLECTION_COLUMN,
  margin: '0 8px',
  flexDirection: 'column',
  height: 'fit-content',
  border: '2px solid green'
})

interface Props {
  meeting: SpotlightGroups_meeting$key
  phaseRef: RefObject<HTMLDivElement>
  viewer: SpotlightGroups_viewer$key
}

const SpotlightGroups = (props: Props) => {
  const {phaseRef} = props
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
  const groupsRef = useRef(null)
  const columnsRef = useRef(null)
  const groupsCount = similarReflectionGroups.length
  const columns = useSpotlightColumns(groupsRef, groupsCount)
  useSortGroupsIntoColumns(similarReflectionGroups, columns)
  const height = useSpotlightGroupsHeight(groupsRef, columnsRef)

  if (!groupsCount) return <SpotlightGroupsEmptyState />
  return (
    <SimilarGroups ref={groupsRef} height={height}>
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
