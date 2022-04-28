import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {ParabolScopingSearchBar_meeting$key} from '../__generated__/ParabolScopingSearchBar_meeting.graphql'
import Icon from './Icon'
import ParabolScopingSearchCurrentFilters from './ParabolScopingSearchCurrentFilters'
import ParabolScopingSearchFilterToggle from './ParabolScopingSearchFilterToggle'
import ParabolScopingSearchInput from './ParabolScopingSearchInput'

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  padding: 3,
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
  meetingRef: ParabolScopingSearchBar_meeting$key
}

const ParabolScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment ParabolScopingSearchBar_meeting on PokerMeeting {
        ...ParabolScopingSearchInput_meeting
        ...ParabolScopingSearchFilterToggle_meeting
        ...ParabolScopingSearchCurrentFilters_meeting
      }
    `,
    meetingRef
  )

  return (
    <SearchBar>
      <SearchBarWrapper>
        <SearchIcon>search</SearchIcon>
        <ParabolScopingSearchInput meeting={meeting} />
        <ParabolScopingSearchFilterToggle meeting={meeting} />
      </SearchBarWrapper>
      <ParabolScopingSearchCurrentFilters meetingRef={meeting} />
    </SearchBar>
  )
}

export default ParabolScopingSearchBar
