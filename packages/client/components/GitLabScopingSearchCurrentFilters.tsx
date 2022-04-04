import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'

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
  meetingRef: any
}

const GitLabScopingSearchCurrentFilters = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitLabScopingSearchCurrentFilters_meeting on PokerMeeting {
        id
        gitlabSearchQuery {
          selectedProjects {
            fullPath
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, gitlabSearchQuery} = meeting
  const {selectedProjects} = gitlabSearchQuery
  const selectedProjectsFullPaths = selectedProjects?.map(({fullPath}) => fullPath)
  console.log('🚀  ~ gitlabSearchQuery', {
    gitlabSearchQuery,
    selectedProjects,
    selectedProjectsFullPaths
  })
  // const isEmpty = !queryString
  return (
    <Wrapper>
      <Description>Current filters: </Description>
      <Items>{selectedProjectsFullPaths}</Items>
    </Wrapper>
  )
}

export default GitLabScopingSearchCurrentFilters
