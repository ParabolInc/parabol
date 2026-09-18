import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import type {JiraScopingCurrentFiltersQuery} from '../../__generated__/JiraScopingCurrentFiltersQuery.graphql'
import {searchFiltersByKey} from '../../shared/integrations/IntegrationSearchFilter'
import type {ScopingSearchState} from '../platform/ScopingSearchState'

const query = graphql`
  query JiraScopingCurrentFiltersQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
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
`

interface Props {
  state: ScopingSearchState
  teamId: string
}

const JiraScopingCurrentFilters = (props: Props) => {
  const {state, teamId} = props
  const data = useLazyLoadQuery<JiraScopingCurrentFiltersQuery>(
    query,
    {teamId},
    {fetchPolicy: 'store-or-network'}
  )
  const projects = data.viewer.teamMember?.integrations.atlassian?.projects
  const selectedProjectNames = [] as string[]
  searchFiltersByKey(state.filters, 'project').forEach((projectId) => {
    const name = projects?.find((project) => project.id === projectId)?.name
    if (name) selectedProjectNames.push(name)
  })
  if (selectedProjectNames.length) return <>{selectedProjectNames.join(', ')}</>
  return <>{state.queryString ? 'None' : 'Viewed in the last 30 days'}</>
}

export default JiraScopingCurrentFilters
