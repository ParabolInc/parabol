import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {JiraScopingCurrentFiltersQuery} from '../../__generated__/JiraScopingCurrentFiltersQuery.graphql'
import {searchFiltersByKey} from '../platform/IntegrationSearchFilter'
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
  queryRef: PreloadedQuery<JiraScopingCurrentFiltersQuery>
}

const JiraScopingCurrentFilters = (props: Props) => {
  const {state, queryRef} = props
  const data = usePreloadedQuery<JiraScopingCurrentFiltersQuery>(query, queryRef)
  const projects = data.viewer.teamMember?.integrations.atlassian?.projects
  const selectedProjectNames = searchFiltersByKey(state.filters, 'project').flatMap(
    (projectId) => projects?.find((project) => project.id === projectId)?.name ?? []
  )
  if (selectedProjectNames.length) return <>{selectedProjectNames.join(', ')}</>
  return <>{state.queryString ? 'None' : 'Viewed in the last 30 days'}</>
}

export default JiraScopingCurrentFilters
