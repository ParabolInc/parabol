import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {GitLabScopingSearchBar_meeting} from '../__generated__/GitLabScopingSearchBar_meeting.graphql'
// import GitLabScopingSearchHistoryToggle from './GitLabScopingSearchHistoryToggle'
import GitLabScopingSearchInput from './GitLabScopingSearchInput'

const SearchBar = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: 16
})
interface Props {
  meeting: GitLabScopingSearchBar_meeting
}

const GitLabScopingSearchBar = (props: Props) => {
  const {meeting} = props
  return (
    <SearchBar>
      {/* <GitLabScopingSearchHistoryToggle meetingRef={meeting} /> */}
      <GitLabScopingSearchInput meetingRef={meeting} />
      {/* <GitLabScopingSearchFilterToggle meetingRef={meeting} /> */}
    </SearchBar>
  )
}

export default createFragmentContainer(GitLabScopingSearchBar, {
  meeting: graphql`
    fragment GitLabScopingSearchBar_meeting on PokerMeeting {
      # ...GitLabScopingSearchHistoryToggle_meeting
      ...GitLabScopingSearchInput_meeting
      # ...GitLabScopingSearchFilterToggle_meeting
    }
  `
})
