import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {GitLabScopingCurrentFiltersQuery} from '../../__generated__/GitLabScopingCurrentFiltersQuery.graphql'
import getNonNullEdges from '../../utils/getNonNullEdges'
import {searchFiltersByKey} from '../platform/IntegrationSearchFilter'
import type {ScopingSearchState} from '../platform/ScopingSearchState'

const query = graphql`
  query GitLabScopingCurrentFiltersQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        integrations {
          gitlab {
            api {
              query {
                projects(
                  ids: null
                  membership: true
                  first: 100
                  sort: "latest_activity_desc"
                  search: ""
                ) {
                  edges {
                    node {
                      ... on _xGitLabProject {
                        __typename
                        id
                        fullPath
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

interface Props {
  state: ScopingSearchState
  queryRef: PreloadedQuery<GitLabScopingCurrentFiltersQuery>
}

const GitLabScopingCurrentFilters = (props: Props) => {
  const {state, queryRef} = props
  const data = usePreloadedQuery<GitLabScopingCurrentFiltersQuery>(query, queryRef)
  const nullableEdges =
    data.viewer.teamMember?.integrations.gitlab.api?.query?.projects?.edges ?? []
  const projects = getNonNullEdges(nullableEdges).map(({node}) => node)
  const selectedProjectsPaths = searchFiltersByKey(state.filters, 'project').flatMap(
    (projectId) => projects.find((project) => project.id === projectId)?.fullPath ?? []
  )
  return <>{selectedProjectsPaths.length ? selectedProjectsPaths.join(', ') : 'None'}</>
}

export default GitLabScopingCurrentFilters
