import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {JiraServerScopingCurrentFiltersQuery} from '../../__generated__/JiraServerScopingCurrentFiltersQuery.graphql'
import {searchFiltersByKey} from '../platform/IntegrationSearchFilter'
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
  queryRef: PreloadedQuery<JiraServerScopingCurrentFiltersQuery>
}

const JiraServerScopingCurrentFilters = (props: Props) => {
  const {state, queryRef} = props
  const data = usePreloadedQuery<JiraServerScopingCurrentFiltersQuery>(query, queryRef)
  const projects = data.viewer.teamMember?.integrations.jiraServer?.projects
  const selectedProjectNames = searchFiltersByKey(state.filters, 'project').flatMap(
    (projectId) => projects?.find((project) => project.id === projectId)?.name ?? []
  )
  return <>{selectedProjectNames.length ? selectedProjectNames.join(', ') : 'None'}</>
}

export default JiraServerScopingCurrentFilters
