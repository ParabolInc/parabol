import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {JiraServerScopingSearchHistoryToggle_meeting$key} from '../__generated__/JiraServerScopingSearchHistoryToggle_meeting.graphql'
import JiraUniversalScopingSearchHistoryToggle from './JiraUniversalScopingSearchHistoryToggle'

interface Props {
  meetingRef: JiraServerScopingSearchHistoryToggle_meeting$key
}

const JiraServerScopingSearchHistoryToggle = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment JiraServerScopingSearchHistoryToggle_meeting on PokerMeeting {
        id
        teamId
        viewerMeetingMember {
          teamMember {
            integrations {
              jiraServer {
                searchQueries {
                  id
                  queryString
                  isJQL
                  projectKeyFilters
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )

  const {id: meetingId, teamId} = meeting
  const {searchQueries} = meeting.viewerMeetingMember?.teamMember.integrations?.jiraServer ?? {}

  return (
    <JiraUniversalScopingSearchHistoryToggle
      service={'jiraServer'}
      jiraSearchQueries={searchQueries}
      meetingId={meetingId}
      teamId={teamId}
    />
  )
}

export default JiraServerScopingSearchHistoryToggle
