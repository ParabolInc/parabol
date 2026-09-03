import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import type {JiraServerScopingSearchFilterMenuRootQuery} from '../__generated__/JiraServerScopingSearchFilterMenuRootQuery.graphql'
import JiraScopingSearchFilterMenu from './JiraScopingSearchFilterMenu'

const query = graphql`
  query JiraServerScopingSearchFilterMenuRootQuery($teamId: ID!, $meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        id
        ... on PokerMeeting {
          jiraServerSearchQuery {
            projectKeyFilters
            isJQL
          }
        }
      }
      teamMember(teamId: $teamId) {
        integrations {
          jiraServer {
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

const JiraServerScopingSearchFilterMenuRoot = (props: Props) => {
  const {teamId, meetingId} = props

  const data = useLazyLoadQuery<JiraServerScopingSearchFilterMenuRootQuery>(
    query,
    {
      teamId,
      meetingId
    },
    {
      fetchPolicy: 'store-or-network'
    }
  )

  const projects = data?.viewer.teamMember?.integrations.jiraServer?.projects ?? []
  const jiraSearchQuery = data?.viewer.meeting?.jiraServerSearchQuery ?? null

  return (
    <JiraScopingSearchFilterMenu
      meetingId={meetingId}
      jiraSearchQuery={jiraSearchQuery}
      projects={projects}
      service='jiraServer'
    />
  )
}

export default JiraServerScopingSearchFilterMenuRoot
