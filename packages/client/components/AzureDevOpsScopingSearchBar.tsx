import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {AzureDevOpsScopingSearchBar_meeting$key} from '../__generated__/AzureDevOpsScopingSearchBar_meeting.graphql'
import AzureDevOpsScopingSearchFilterToggle from './AzureDevOpsScopingSearchFilterToggle'
import AzureDevOpsScopingSearchInput from './AzureDevOpsScopingSearchInput'
import Icon from './Icon'

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
  meetingRef: AzureDevOpsScopingSearchBar_meeting$key
}

const AzureDevOpsScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment AzureDevOpsScopingSearchBar_meeting on PokerMeeting {
        ...AzureDevOpsScopingSearchInput_meeting
        ...AzureDevOpsScopingSearchFilterToggle_meeting
      }
    `,
    meetingRef
  )
  return (
    <SearchBar>
      <SearchBarWrapper>
        <SearchIcon>search</SearchIcon>
        <AzureDevOpsScopingSearchInput meeting={meeting} />
        <AzureDevOpsScopingSearchFilterToggle meeting={meeting} />
      </SearchBarWrapper>
    </SearchBar>
  )
}

export default AzureDevOpsScopingSearchBar
