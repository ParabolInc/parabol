import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAllIntegrations from '~/hooks/useAllIntegrations'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '~/hooks/useMenu'
import RepoIntegrationGitHubMenuItem from './RepoIntegrationGitHubMenuItem'
import {NewGitHubIssueMenu_repoIntegrations} from '~/__generated__/NewGitHubIssueMenu_repoIntegrations.graphql'
import useSearchFilter from '~/hooks/useSearchFilter'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import {SearchMenuItem} from './SearchMenuItem'

interface Props {
  handleSelectNameWithOwner: (key: string) => void
  menuProps: MenuProps
  repoIntegrations: NewGitHubIssueMenu_repoIntegrations
  teamId: string
  userId: string
}

const getValue = (item: {projectName?: string; nameWithOwner?: string}) => {
  return item.projectName || item.nameWithOwner || 'Unknown Project'
}

const NewGitHubIssueMenu = (props: Props) => {
  const {handleSelectNameWithOwner, menuProps, repoIntegrations, teamId, userId} = props
  const {hasMore, items} = repoIntegrations

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
      ariaLabel='Select GitHub project'
      keepParentFocus
      {...menuProps}
      resetActiveOnChanges={[allItems]}
    >
      <SearchMenuItem placeholder='Search GitHub' onChange={onQueryChange} value={query} />
      {(query && allItems.length === 0 && status !== 'loading' && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No integrations found!
        </EmptyDropdownMenuItemLabel>
      )) ||
        null}

      {allItems.slice(0, 10).map((repoIntegration) => {
        const {id, __typename} = repoIntegration
        if (__typename === '_xGitHubRepository') {
          const {nameWithOwner} = repoIntegration
          const onClick = () => {
            handleSelectNameWithOwner(nameWithOwner)
          }
          return (
            <RepoIntegrationGitHubMenuItem
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

export default createFragmentContainer(NewGitHubIssueMenu, {
  repoIntegrations: graphql`
    fragment NewGitHubIssueMenu_repoIntegrations on RepoIntegrationQueryPayload {
      hasMore
      items {
        ... on _xGitHubRepository {
          __typename
          id
          nameWithOwner
        }
        ...RepoIntegrationGitHubMenuItem_repoIntegration
      }
    }
  `
})
