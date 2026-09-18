import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import getNonNullEdges from '~/utils/getNonNullEdges'
import type {GitLabScopingSearchFilterMenuRootQuery} from '../__generated__/GitLabScopingSearchFilterMenuRootQuery.graphql'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import GitLabScopingSearchFilterMenu from './GitLabScopingSearchFilterMenu'

const query = graphql`
  query GitLabScopingSearchFilterMenuRootQuery($teamId: ID!) {
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
                  search: "" # search tells Relay this query differs to the scoping results query
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

const GitLabScopingSearchFilterMenuRoot = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props
  const data = useLazyLoadQuery<GitLabScopingSearchFilterMenuRootQuery>(
    query,
    {teamId},
    {fetchPolicy: 'store-or-network'}
  )
  const nullableEdges =
    data.viewer.teamMember?.integrations.gitlab.api?.query?.projects?.edges ?? []
  const projects = useMemo(() => getNonNullEdges(nullableEdges).map(({node}) => node), [data])
  return <GitLabScopingSearchFilterMenu meetingId={meetingId} state={state} projects={projects} />
}

export default GitLabScopingSearchFilterMenuRoot
