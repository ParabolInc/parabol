import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {AzureDevOpsScopingSearchBar_meeting} from '../__generated__/AzureDevOpsScopingSearchBar_meeting.graphql'
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
  meeting: AzureDevOpsScopingSearchBar_meeting
}

const AzureDevOpsScopingSearchBar = (props: Props) => {
  const {meeting} = props
  return (
    <SearchBar>
      <SearchIcon>search</SearchIcon>
      <AzureDevOpsScopingSearchInput meeting={meeting} />
      <AzureDevOpsScopingSearchFilterToggle meeting={meeting} />
    </SearchBar>
  )
}

export default createFragmentContainer(AzureDevOpsScopingSearchBar, {
  meeting: graphql`
    fragment AzureDevOpsScopingSearchBar_meeting on PokerMeeting {
      ...AzureDevOpsScopingSearchInput_meeting
      ...AzureDevOpsScopingSearchFilterToggle_meeting
    }
  `
})
