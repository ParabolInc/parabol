import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {GitHubScopingSearchBar_meeting$key} from '../__generated__/GitHubScopingSearchBar_meeting.graphql'
import GitHubScopingSearchFilterToggle from './GitHubScopingSearchFilterToggle'
import GitHubScopingSearchHistoryToggle from './GitHubScopingSearchHistoryToggle'
import GitHubScopingSearchInput from './GitHubScopingSearchInput'

const SearchBar = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: 16
})
interface Props {
  meetingRef: GitHubScopingSearchBar_meeting$key
}

const GitHubScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment GitHubScopingSearchBar_meeting on PokerMeeting {
        ...GitHubScopingSearchHistoryToggle_meeting
        ...GitHubScopingSearchInput_meeting
        ...GitHubScopingSearchFilterToggle_meeting
      }
    `,
    meetingRef
  )

  return (
    <SearchBar>
      <GitHubScopingSearchHistoryToggle meetingRef={meeting} />
      <GitHubScopingSearchInput meetingRef={meeting} />
      <GitHubScopingSearchFilterToggle meetingRef={meeting} />
    </SearchBar>
  )
}

export default GitHubScopingSearchBar
