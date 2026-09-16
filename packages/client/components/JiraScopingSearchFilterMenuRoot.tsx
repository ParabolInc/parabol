import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import type {JiraScopingSearchFilterMenuRootQuery} from '../__generated__/JiraScopingSearchFilterMenuRootQuery.graphql'
import JiraScopingSearchFilterMenu from './JiraScopingSearchFilterMenu'

const query = graphql`
  query JiraScopingSearchFilterMenuRootQuery($teamId: ID!, $meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        id
        ... on PokerMeeting {
          jiraSearchQuery {
            projectKeyFilters
            isJQL
          }
        }
      }
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            projects {
              id
              name
              avatar
            }
          }
        }
      }
    }
  }
`

interface Props {
  teamId: string
  meetingId: string
}

const JiraScopingSearchFilterMenuRoot = (props: Props) => {
  const {teamId, meetingId} = props

  const data = useLazyLoadQuery<JiraScopingSearchFilterMenuRootQuery>(
    query,
    {
      teamId,
      meetingId
    },
    {
      fetchPolicy: 'store-or-network'
    }
  )

  const projects = data.viewer.teamMember?.integrations.atlassian?.projects ?? []
  const jiraSearchQuery = data.viewer.meeting?.jiraSearchQuery ?? null

  return (
    <JiraScopingSearchFilterMenu
      meetingId={meetingId}
      jiraSearchQuery={jiraSearchQuery}
      projects={projects}
      service={'jira'}
    />
  )
}

export default JiraScopingSearchFilterMenuRoot
