import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {JiraScopingSearchBar_meeting$key} from '../__generated__/JiraScopingSearchBar_meeting.graphql'
import JiraScopingSearchFilterToggle from './JiraScopingSearchFilterToggle'
import JiraScopingSearchHistoryToggle from './JiraScopingSearchHistoryToggle'
import JiraScopingSearchInput from './JiraScopingSearchInput'
import ScopingSearchBar from './ScopingSearchBar'

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
        ...JiraScopingSearchInput_meeting
        id
        teamId
        jiraSearchQuery {
          queryString
          projectKeyFilters
          isJQL
        }
        viewerMeetingMember {
          teamMember {
            integrations {
              atlassian {
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

  const {jiraSearchQuery, viewerMeetingMember} = meeting
  const {queryString, projectKeyFilters} = jiraSearchQuery
  const projects = viewerMeetingMember?.teamMember.integrations.atlassian?.projects

  const selectedProjectsPaths = [] as string[]
  projectKeyFilters?.forEach((projectId) => {
    const selectedProjectPath = projects?.find((project) => project.id === projectId)?.name
    if (selectedProjectPath) selectedProjectsPaths.push(selectedProjectPath)
  })
  const currentFilters = selectedProjectsPaths.length
    ? selectedProjectsPaths.join(', ')
    : queryString
      ? 'None'
      : 'Viewed in the last 30 days'

  return (
    <ScopingSearchBar currentFilters={currentFilters}>
      <JiraScopingSearchHistoryToggle meetingRef={meeting} />
      <JiraScopingSearchInput meetingRef={meeting} />
      <JiraScopingSearchFilterToggle meetingRef={meeting} />
    </ScopingSearchBar>
  )
}

export default JiraScopingSearchBar
