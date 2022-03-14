import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
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
}

const getValue = (item: {projectName?: string; nameWithOwner?: string}) => {
  return item.projectName || item.nameWithOwner || 'Unknown Project'
}

const NewGitLabIssueMenu = (props: Props) => {
  const {handleSelectFullPath, menuProps, repoIntegrations, teamId, userId} = props
  const {hasMore, items} = repoIntegrations
  console.log('🚀  ~ repoIntegrations', repoIntegrations)

  const {query, filteredItems: filteredIntegrations, onQueryChange} = useSearchFilter(
    items ?? [],
    getValue
  )

  const atmosphere = useAtmosphere()
  const {allItems, status} = useAllIntegrations(
    atmosphere,
    query,
    filteredIntegrations,
    !!hasMore,
    teamId,
    userId
  )

  return (
    <Menu
      ariaLabel='Select GitLab project'
      keepParentFocus
      {...menuProps}
      resetActiveOnChanges={[allItems]}
    >
      <SearchMenuItem placeholder='Search GitLab' onChange={onQueryChange} value={query} />
      {(query && allItems.length === 0 && status !== 'loading' && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No integrations found!
        </EmptyDropdownMenuItemLabel>
      )) ||
        null}

      {allItems.slice(0, 10).map((repoIntegration) => {
        const {id, __typename} = repoIntegration
        if (__typename === '_xGitLabProject') {
          const {fullPath} = repoIntegration
          const onClick = () => {
            handleSelectFullPath(fullPath)
          }
          return (
            <RepoIntegrationGitLabMenuItem
              key={id}
              query={query}
              repoIntegration={repoIntegration}
              onClick={onClick}
            />
          )
        }
        return null
      })}
    </Menu>
  )
}

export default createFragmentContainer(NewGitLabIssueMenu, {
  repoIntegrations: graphql`
    fragment NewGitLabIssueMenu_repoIntegrations on RepoIntegrationQueryPayload {
      hasMore
      items {
        ... on _xGitLabProject {
          __typename
          id
          fullPath
        }
        ...RepoIntegrationGitLabMenuItem_repoIntegration
      }
    }
  `
})
