import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {JiraScopingSearchBar_meeting$key} from '../__generated__/JiraScopingSearchBar_meeting.graphql'
import JiraScopingSearchCurrentFilters from './JiraScopingSearchCurrentFilters'
import JiraScopingSearchFilterToggle from './JiraScopingSearchFilterToggle'
import JiraScopingSearchHistoryToggle from './JiraScopingSearchHistoryToggle'
import JiraScopingSearchInput from './JiraScopingSearchInput'

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
  meetingRef: JiraScopingSearchBar_meeting$key
}

const JiraScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment JiraScopingSearchBar_meeting on PokerMeeting {
        ...JiraScopingSearchHistoryToggle_meeting
        ...JiraScopingSearchInput_meeting
        ...JiraScopingSearchFilterToggle_meeting
        ...JiraScopingSearchCurrentFilters_meeting
      }
    `,
    meetingRef
  )

  return (
    <SearchBar>
      <SearchBarWrapper>
        <JiraScopingSearchHistoryToggle meeting={meeting} />
        <JiraScopingSearchInput meeting={meeting} />
        <JiraScopingSearchFilterToggle meeting={meeting} />
      </SearchBarWrapper>
      <JiraScopingSearchCurrentFilters meetingRef={meeting} />
    </SearchBar>
  )
}

export default JiraScopingSearchBar
