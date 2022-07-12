import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ParabolScopingSearchBar_meeting$key} from '../__generated__/ParabolScopingSearchBar_meeting.graphql'
import ParabolScopingSearchFilterToggle from './ParabolScopingSearchFilterToggle'
import ScopingSearchBar from './ScopingSearchBar'
import ScopingSearchHistoryToggle from './ScopingSearchHistoryToggle'
import ScopingSearchInput from './ScopingSearchInput'

interface Props {
  meetingRef: ParabolScopingSearchBar_meeting$key
}

const ParabolScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment ParabolScopingSearchBar_meeting on PokerMeeting {
        id
        parabolSearchQuery {
          queryString
          statusFilters
        }
        ...ParabolScopingSearchFilterToggle_meeting
      }
    `,
    meetingRef
  )

  const {id: meetingId, parabolSearchQuery} = meeting
  const {queryString, statusFilters} = parabolSearchQuery
  const currentFilters = statusFilters?.length ? statusFilters.join(', ') : 'None'

  return (
    <ScopingSearchBar currentFilters={currentFilters}>
      <ScopingSearchHistoryToggle />
      <ScopingSearchInput
        placeholder={'Search Parabol tasks'}
        queryString={queryString ?? ''}
        meetingId={meetingId}
        linkedRecordName={'parabolSearchQuery'}
        service={'PARABOL'}
      />
      <ParabolScopingSearchFilterToggle meeting={meeting} />
    </ScopingSearchBar>
  )
}

export default ParabolScopingSearchBar
