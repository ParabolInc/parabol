import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {JiraScopingSearchHistoryToggle_meeting$key} from '../__generated__/JiraScopingSearchHistoryToggle_meeting.graphql'
import JiraUniversalScopingSearchHistoryToggle from './JiraUniversalScopingSearchHistoryToggle'

interface Props {
  meetingRef: JiraScopingSearchHistoryToggle_meeting$key
}

const JiraScopingSearchHistoryToggle = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment JiraScopingSearchHistoryToggle_meeting on PokerMeeting {
        id
        teamId
        viewerMeetingMember {
          teamMember {
            integrations {
              atlassian {
                jiraSearchQueries {
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
  const {jiraSearchQueries} = meeting.viewerMeetingMember?.teamMember.integrations?.atlassian ?? {}

  return (
    <JiraUniversalScopingSearchHistoryToggle
      service={'jira'}
      jiraSearchQueries={jiraSearchQueries}
      meetingId={meetingId}
      teamId={teamId}
    />
  )
}

export default JiraScopingSearchHistoryToggle
