import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import type {GitLabScopingCurrentFiltersQuery} from '../../__generated__/GitLabScopingCurrentFiltersQuery.graphql'
import {searchFiltersByKey} from '../../shared/integrations/IntegrationSearchFilter'
import getNonNullEdges from '../../utils/getNonNullEdges'
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
  teamId: string
}

const GitLabScopingCurrentFilters = (props: Props) => {
  const {state, teamId} = props
  const data = useLazyLoadQuery<GitLabScopingCurrentFiltersQuery>(
    query,
    {teamId},
    {fetchPolicy: 'store-or-network'}
  )
  const nullableEdges =
    data.viewer.teamMember?.integrations.gitlab.api?.query?.projects?.edges ?? []
  const projects = getNonNullEdges(nullableEdges).map(({node}) => node)
  const selectedProjectsPaths = [] as string[]
  searchFiltersByKey(state.filters, 'project').forEach((projectId) => {
    const fullPath = projects.find((project) => project.id === projectId)?.fullPath
    if (fullPath) selectedProjectsPaths.push(fullPath)
  })
  return <>{selectedProjectsPaths.length ? selectedProjectsPaths.join(', ') : 'None'}</>
}

export default GitLabScopingCurrentFilters
