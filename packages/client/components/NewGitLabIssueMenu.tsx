import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {
  createFragmentContainer,
  readInlineData,
  usePaginationFragment,
  usePreloadedQuery
} from 'react-relay'
import useAllIntegrations from '~/hooks/useAllIntegrations'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '~/hooks/useMenu'
import RepoIntegrationGitLabMenuItem from './RepoIntegrationGitLabMenuItem'
import {NewGitLabIssueMenu_repoIntegrations} from '~/__generated__/NewGitLabIssueMenu_repoIntegrations.graphql'
import useSearchFilter from '~/hooks/useSearchFilter'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import {SearchMenuItem} from './SearchMenuItem'

interface Props {
  handleSelectFullPath: (key: string) => void
  menuProps: MenuProps
  repoIntegrations: NewGitLabIssueMenu_repoIntegrations
  teamId: string
  userId: string
  viewerRef: any
  queryRef: any
}

const getValue = (item: {fullPath?: string}) => {
  console.log('🚀  ~ getVal --', item)
  // return item.projectName || item.nameWithOwner || 'Unknown Project'
  return item.fullPath || 'Unknown Project'
}

const NewGitLabIssueMenu = (props: Props) => {
  const {
    handleSelectFullPath,
    menuProps,
    repoIntegrations,
    teamId,
    userId,
    viewerRef,
    queryRef
  } = props

  const atmosphere = useAtmosphere()

  const queryTest = usePreloadedQuery(
    graphql`
      query NewGitLabIssueMenuQuery($teamId: ID!) {
        ...NewGitLabIssueMenu_query
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const paginationRes = usePaginationFragment(
    graphql`
      fragment NewGitLabIssueMenu_query on Query
        @argumentDefinitions(
          first: {type: "Int", defaultValue: 10}
          after: {type: "String"}
          search: {type: "String"}
          projectIds: {type: "[ID!]", defaultValue: null}
        )
        @refetchable(queryName: "NewGitLabIssueMenuPaginationQuery") {
        viewer {
          ...NewGitLabIssueInput_viewer
          teamMember(teamId: $teamId) {
            integrations {
              gitlab {
                api {
                  errors {
                    message
                    locations {
                      line
                      column
                    }
                    path
                  }
                  query {
                    projects(membership: true, first: $first, after: $after, search: $search)
                      @connection(key: "NewGitLabIssueMenu_projects") {
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
    `,
    queryTest
  )
  const projectEdges =
    paginationRes?.data?.viewer.teamMember.integrations.gitlab.api.query.projects.edges

  console.log('🚀  ~ QUERY', {queryTest, paginationRes, projectEdges})

  // const {hasMore, items} = repoIntegrations

  // const {query, filteredItems: filteredIntegrations, onQueryChange} = useSearchFilter(
  //   items ?? [],
  //   getValue
  // )

  // const {allItems, status} = useAllIntegrations(
  //   atmosphere,
  //   query,
  //   filteredIntegrations,
  //   !!hasMore,
  //   teamId,
  //   userId
  // )
  // console.log('🚀  ~ allItems', allItems)

  return (
    <Menu
      ariaLabel='Select GitLab project'
      keepParentFocus
      {...menuProps}
      // resetActiveOnChanges={[allItems]}
    >
      <SearchMenuItem placeholder='Search GitLab' onChange={() => {}} />
      {/* {(query && allItems.length === 0 && status !== 'loading' && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No integrations found!
        </EmptyDropdownMenuItemLabel>
      )) ||
        null} */}

      {projectEdges.slice(0, 10).map((edge) => {
        const {node} = edge
        if (!node) return null
        const {id, fullPath} = node
        const onClick = () => {
          handleSelectFullPath(fullPath)
        }
        return (
          <RepoIntegrationGitLabMenuItem
            key={id}
            // query={query}
            // repoIntegration={repoIntegration}
            fullPath={fullPath}
            onClick={onClick}
          />
        )
      })}
    </Menu>
  )
}

export default NewGitLabIssueMenu
