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
  marginRight: 12
})

const SearchBar = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: 16
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
      <SearchIcon>search</SearchIcon>
      <AzureDevOpsScopingSearchInput meeting={meeting} />
      <AzureDevOpsScopingSearchFilterToggle meeting={meeting} />
    </SearchBar>
  )
}

export default AzureDevOpsScopingSearchBar
