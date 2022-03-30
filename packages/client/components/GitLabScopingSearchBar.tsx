import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import {GitLabScopingSearchBar_meeting$key} from '../__generated__/GitLabScopingSearchBar_meeting.graphql'
import GitLabScopingSearchInput from './GitLabScopingSearchInput'
import Icon from './Icon'

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  marginRight: 12
})

const SearchBar = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: 16
})
interface Props {
  meetingRef: GitLabScopingSearchBar_meeting$key
}

const GitLabScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment GitLabScopingSearchBar_meeting on PokerMeeting {
        ...GitLabScopingSearchInput_meeting
        # ...GitLabScopingSearchFilterToggle_meeting
      }
    `,
    meetingRef
  )

  return (
    <SearchBar>
      <SearchIcon>search</SearchIcon>
      <GitLabScopingSearchInput meetingRef={meeting} />
      {/* <GitLabScopingSearchFilterToggle meetingRef={meeting} /> */}
    </SearchBar>
  )
}

export default GitLabScopingSearchBar
