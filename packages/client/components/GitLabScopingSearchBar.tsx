import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {GitLabScopingSearchBar_meeting$key} from '../__generated__/GitLabScopingSearchBar_meeting.graphql'
import GitLabScopingSearchFilterToggle from './GitLabScopingSearchFilterToggle'
import ScopingSearchBar from './ScopingSearchBar'
import ScopingSearchHistoryToggle from './ScopingSearchHistoryToggle'
import ScopingSearchInput from './ScopingSearchInput'

interface Props {
  meetingRef: GitLabScopingSearchBar_meeting$key
}

const GitLabScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment GitLabScopingSearchBar_meeting on PokerMeeting {
        ...GitLabScopingSearchFilterToggle_meeting
        id
        gitlabSearchQuery {
          selectedProjectsIds
          queryString
        }
        viewerMeetingMember {
          teamMember {
            integrations {
              gitlab {
                projects {
                  ... on _xGitLabProject {
                    id
                    fullPath
                  }
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )

  const {gitlabSearchQuery, viewerMeetingMember, id: meetingId} = meeting
  const {selectedProjectsIds, queryString} = gitlabSearchQuery
  const projects = viewerMeetingMember?.teamMember.integrations.gitlab.projects

  const selectedProjectsPaths = [] as string[]
  selectedProjectsIds?.forEach((projectId) => {
    const selectedProjectPath = projects?.find((project) => project.id === projectId)?.fullPath
    if (selectedProjectPath) selectedProjectsPaths.push(selectedProjectPath)
  })
  const currentFilters = selectedProjectsPaths.length ? selectedProjectsPaths.join(', ') : 'None'

  return (
    <ScopingSearchBar currentFilters={currentFilters}>
      <ScopingSearchHistoryToggle />
      <ScopingSearchInput
        placeholder={'Search GitLab issues...'}
        queryString={queryString}
        meetingId={meetingId}
        linkedRecordName={'gitlabSearchQuery'}
        service={'gitlab'}
      />
      <GitLabScopingSearchFilterToggle meetingRef={meeting} />
    </ScopingSearchBar>
  )
}

export default GitLabScopingSearchBar
