import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import {GitLabScopingSearchBar_meeting$key} from '../__generated__/GitLabScopingSearchBar_meeting.graphql'
import GitLabScopingSearchFilterToggle from './GitLabScopingSearchFilterToggle'
import GitLabScopingSearchInput from './GitLabScopingSearchInput'
import Icon from './Icon'

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  marginRight: 12
})

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
  meetingRef: GitLabScopingSearchBar_meeting$key
}

const GitLabScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment GitLabScopingSearchBar_meeting on PokerMeeting {
        ...GitLabScopingSearchInput_meeting
        ...GitLabScopingSearchFilterToggle_meeting
      }
    `,
    meetingRef
  )

  return (
    <SearchBar>
      <SearchBarWrapper>
        <SearchIcon>search</SearchIcon>
        <GitLabScopingSearchInput meetingRef={meeting} />
        <GitLabScopingSearchFilterToggle meetingRef={meeting} />
      </SearchBarWrapper>
    </SearchBar>
  )
}

export default GitLabScopingSearchBar
