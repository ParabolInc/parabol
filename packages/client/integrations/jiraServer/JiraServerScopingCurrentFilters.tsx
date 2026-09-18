import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import type {JiraServerScopingCurrentFiltersQuery} from '../../__generated__/JiraServerScopingCurrentFiltersQuery.graphql'
import {searchFiltersByKey} from '../../shared/integrations/IntegrationSearchFilter'
import type {ScopingSearchState} from '../platform/ScopingSearchState'

const query = graphql`
  query JiraServerScopingCurrentFiltersQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
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
  }
`

interface Props {
  state: ScopingSearchState
  teamId: string
}

const JiraServerScopingCurrentFilters = (props: Props) => {
  const {state, teamId} = props
  const data = useLazyLoadQuery<JiraServerScopingCurrentFiltersQuery>(
    query,
    {teamId},
    {fetchPolicy: 'store-or-network'}
  )
  const projects = data.viewer.teamMember?.integrations.jiraServer?.projects
  const selectedProjectNames = [] as string[]
  searchFiltersByKey(state.filters, 'project').forEach((projectId) => {
    const name = projects?.find((project) => project.id === projectId)?.name
    if (name) selectedProjectNames.push(name)
  })
  return <>{selectedProjectNames.length ? selectedProjectNames.join(', ') : 'None'}</>
}

export default JiraServerScopingCurrentFilters
