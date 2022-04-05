import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {GitHubScopingSearchBar_meeting$key} from '../__generated__/GitHubScopingSearchBar_meeting.graphql'
import GitHubScopingSearchFilterToggle from './GitHubScopingSearchFilterToggle'
import GitHubScopingSearchHistoryToggle from './GitHubScopingSearchHistoryToggle'
import GitHubScopingSearchInput from './GitHubScopingSearchInput'

const SearchBar = styled('div')({
  padding: 16
})

const SearchBarWrapper = styled('div')({
  alignItems: 'center',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: '40px',
  display: 'flex',
  height: 44,
  padding: '0 16px',
  width: '100%'
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
      <SearchBarWrapper>
        <GitHubScopingSearchHistoryToggle meetingRef={meeting} />
        <GitHubScopingSearchInput meetingRef={meeting} />
        <GitHubScopingSearchFilterToggle meetingRef={meeting} />
      </SearchBarWrapper>
    </SearchBar>
  )
}

export default GitHubScopingSearchBar
