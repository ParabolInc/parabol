import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {JiraScopingSearchBar_meeting$key} from '../__generated__/JiraScopingSearchBar_meeting.graphql'
import JiraScopingSearchFilterToggle from './JiraScopingSearchFilterToggle'
import JiraScopingSearchHistoryToggle from './JiraScopingSearchHistoryToggle'
import ScopingSearchBar from './ScopingSearchBar'
import ScopingSearchInput from './ScopingSearchInput'

interface Props {
  meetingRef: JiraScopingSearchBar_meeting$key
}

const JiraScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment JiraScopingSearchBar_meeting on PokerMeeting {
        ...JiraScopingSearchFilterToggle_meeting
        ...JiraScopingSearchHistoryToggle_meeting
        id
        teamId
        jiraSearchQuery {
          projectKeyFilters
          queryString
          isJQL
        }
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
                projects {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )

  const {id: meetingId} = meeting

  const {jiraSearchQuery, viewerMeetingMember} = meeting
  const {isJQL, queryString, projectKeyFilters} = jiraSearchQuery
  const projects = viewerMeetingMember?.teamMember.integrations.atlassian?.projects

  const selectedProjectsPaths = [] as string[]
  projectKeyFilters?.forEach((projectId) => {
    const selectedProjectPath = projects?.find((project) => project.id === projectId)?.name
    if (selectedProjectPath) selectedProjectsPaths.push(selectedProjectPath)
  })
  const currentFilters = selectedProjectsPaths.length ? selectedProjectsPaths.join(', ') : 'None'

  const placeholder = isJQL ? `SPRINT = fun AND PROJECT = dev` : 'Search issues on Jira'
  return (
    <ScopingSearchBar currentFilters={currentFilters}>
      <JiraScopingSearchHistoryToggle meetingRef={meeting} />
      <ScopingSearchInput
        placeholder={placeholder}
        queryString={queryString}
        meetingId={meetingId}
        linkedRecordName={'jiraSearchQuery'}
      />
      <JiraScopingSearchFilterToggle meetingRef={meeting} />
    </ScopingSearchBar>
  )
}

export default JiraScopingSearchBar
