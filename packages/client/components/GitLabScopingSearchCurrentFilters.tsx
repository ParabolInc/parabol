import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import {GitLabScopingSearchCurrentFilters_meeting$key} from '../__generated__/GitLabScopingSearchCurrentFilters_meeting.graphql'

const Wrapper = styled('div')({
  width: '100%',
  display: 'flex',
  paddingLeft: '66px',
  paddingTop: '6px'
})

const Description = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 16,
  fontWeight: 500
})

const Items = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 16,
  fontWeight: 600,
  fontStyle: 'italic',
  paddingLeft: 4
})

interface Props {
  meetingRef: GitLabScopingSearchCurrentFilters_meeting$key
}

const GitLabScopingSearchCurrentFilters = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitLabScopingSearchCurrentFilters_meeting on PokerMeeting {
        gitlabSearchQuery {
          selectedProjects {
            fullPath
          }
        }
      }
    `,
    meetingRef
  )
  const {gitlabSearchQuery} = meeting
  const {selectedProjects} = gitlabSearchQuery
  const selectedProjectsFullPaths =
    selectedProjects?.map((project, idx) =>
      idx === 0 ? project.fullPath : `, ${project.fullPath}`
    ) ?? 'None'
  return (
    <Wrapper>
      <Description>Current filters: </Description>
      <Items>{selectedProjectsFullPaths}</Items>
    </Wrapper>
  )
}

export default GitLabScopingSearchCurrentFilters
