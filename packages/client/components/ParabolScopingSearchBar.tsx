import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {ParabolScopingSearchBar_meeting$key} from '../__generated__/ParabolScopingSearchBar_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
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

  const atmosphere = useAtmosphere()
  const {id: meetingId, parabolSearchQuery} = meeting
  const {queryString, statusFilters} = parabolSearchQuery
  const currentFilters = statusFilters?.length ? statusFilters.join(', ') : 'None'
  const setQueryString = (nextQueryString: string) => {
    commitLocalUpdate(atmosphere, (store) => {
      store
        .get(meetingId)
        ?.getLinkedRecord('parabolSearchQuery')
        ?.setValue(nextQueryString, 'queryString')
    })
  }

  return (
    <ScopingSearchBar currentFilters={currentFilters}>
      <ScopingSearchHistoryToggle />
      <ScopingSearchInput
        placeholder={'Search Parabol tasks'}
        queryString={queryString ?? ''}
        meetingId={meetingId}
        service={'PARABOL'}
        onQueryStringChange={setQueryString}
      />
      <ParabolScopingSearchFilterToggle meeting={meeting} />
    </ScopingSearchBar>
  )
}

export default ParabolScopingSearchBar
