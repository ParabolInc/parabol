import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {JiraServerScopingSearchBar_meeting$key} from '../__generated__/JiraServerScopingSearchBar_meeting.graphql'
import JiraServerScopingSearchFilterToggle from './JiraServerScopingSearchFilterToggle'
import ScopingSearchBar from './ScopingSearchBar'
import ScopingSearchHistoryToggle from './ScopingSearchHistoryToggle'
import ScopingSearchInput from './ScopingSearchInput'

interface Props {
  meetingRef: JiraServerScopingSearchBar_meeting$key
}

const JiraServerScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment JiraServerScopingSearchBar_meeting on PokerMeeting {
        id
        jiraServerSearchQuery {
          projectKeyFilters
          queryString
          isJQL
        }
        ...JiraServerScopingSearchFilterToggle_meeting
      }
    `,
    meetingRef
  )

  const {id} = meeting
  const {isJQL, queryString} = meeting.jiraServerSearchQuery
  const placeholder = isJQL ? `SPRINT = fun AND PROJECT = dev` : 'Search issues on Jira Server'

  return (
    <ScopingSearchBar>
      <ScopingSearchHistoryToggle />
      <ScopingSearchInput
        placeholder={placeholder}
        queryString={queryString}
        meetingId={id}
        linkedRecordName={'jiraServerSearchQuery'}
      />
      <JiraServerScopingSearchFilterToggle meetingRef={meeting} />
    </ScopingSearchBar>
  )
}

export default JiraServerScopingSearchBar
