import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ParabolScopingSearchBar_meeting} from '../__generated__/ParabolScopingSearchBar_meeting.graphql'
import ParabolScopingSearchHistoryToggle from './ParabolScopingSearchHistoryToggle'
import ParabolScopingSearchInput from './ParabolScopingSearchInput'
import ParabolScopingSearchFilterToggle from './ParabolScopingSearchFilterToggle'
import styled from '@emotion/styled'

const SearchBar = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: 16
})

interface Props {
  meeting: ParabolScopingSearchBar_meeting
}

const ParabolScopingSearchBar = (props: Props) => {
  const {meeting} = props
  return (
    <SearchBar>
      <ParabolScopingSearchHistoryToggle />
      <ParabolScopingSearchInput meeting={meeting} />
      <ParabolScopingSearchFilterToggle meeting={meeting} />
    </SearchBar>
  )
}

export default createFragmentContainer(ParabolScopingSearchBar, {
  meeting: graphql`
    fragment ParabolScopingSearchBar_meeting on PokerMeeting {
      ...ParabolScopingSearchInput_meeting
      ...ParabolScopingSearchFilterToggle_meeting
    }
  `
})
