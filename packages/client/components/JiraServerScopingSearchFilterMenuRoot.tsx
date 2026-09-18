import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import type {JiraServerScopingSearchFilterMenuRootQuery} from '../__generated__/JiraServerScopingSearchFilterMenuRootQuery.graphql'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import JiraScopingSearchFilterMenu from './JiraScopingSearchFilterMenu'

const query = graphql`
  query JiraServerScopingSearchFilterMenuRootQuery($teamId: ID!) {
    viewer {
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

const JiraServerScopingSearchFilterMenuRoot = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props

  const data = useLazyLoadQuery<JiraServerScopingSearchFilterMenuRootQuery>(
    query,
    {teamId},
    {fetchPolicy: 'store-or-network'}
  )

  const projects = data.viewer.teamMember?.integrations.jiraServer?.projects ?? []

  return (
    <JiraScopingSearchFilterMenu
      meetingId={meetingId}
      state={state}
      projects={projects}
      service={'jiraServer'}
    />
  )
}

export default JiraServerScopingSearchFilterMenuRoot
