import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {JiraServerScopingSearchBar_meeting$key} from '../__generated__/JiraServerScopingSearchBar_meeting.graphql'
import JiraServerScopingSearchFilterToggle from './JiraServerScopingSearchFilterToggle'
import JiraServerScopingSearchHistoryToggle from './JiraServerScopingSearchHistoryToggle'
import ScopingSearchBar from './ScopingSearchBar'
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
        viewerMeetingMember {
          teamMember {
            integrations {
              jiraServer {
                projects {
                  id
                  name
                }
              }
            }
          }
        }
        ...JiraServerScopingSearchFilterToggle_meeting
        ...JiraServerScopingSearchHistoryToggle_meeting
      }
    `,
    meetingRef
  )

  const {id: meetingId, viewerMeetingMember, jiraServerSearchQuery} = meeting
  const {isJQL, queryString, projectKeyFilters} = jiraServerSearchQuery
  const jiraServer = viewerMeetingMember?.teamMember.integrations.jiraServer

  const projects = jiraServer?.projects
  const selectedProjectsPaths = [] as string[]
  projectKeyFilters?.forEach((projectId) => {
    const selectedProjectPath = projects?.find((project) => project.id === projectId)?.name
    if (selectedProjectPath) selectedProjectsPaths.push(selectedProjectPath)
  })
  const currentFilters = selectedProjectsPaths.length ? selectedProjectsPaths.join(', ') : 'None'

  const placeholder = isJQL ? `SPRINT = fun AND PROJECT = dev` : 'Search issues on Jira Server'

  return (
    <ScopingSearchBar currentFilters={currentFilters}>
      <JiraServerScopingSearchHistoryToggle meetingRef={meeting} />
      <ScopingSearchInput
        placeholder={placeholder}
        queryString={queryString}
        meetingId={meetingId}
        linkedRecordName={'jiraServerSearchQuery'}
        service={'jiraServer'}
      />
      <JiraServerScopingSearchFilterToggle meetingRef={meeting} />
    </ScopingSearchBar>
  )
}

export default JiraServerScopingSearchBar
