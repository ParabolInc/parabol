import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAllIntegrations from '~/hooks/useAllIntegrations'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '~/hooks/useMenu'
import RepoIntegrationJiraMenuItem from './RepoIntegrationJiraMenuItem'
import {NewJiraIssueMenu_repoIntegrations} from '~/__generated__/NewJiraIssueMenu_repoIntegrations.graphql'
import useSearchFilter from '~/hooks/useSearchFilter'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import {SearchMenuItem} from './SearchMenuItem'

interface Props {
  handleSelectProjectKey: (key: string) => void
  menuProps: MenuProps
  repoIntegrations: NewJiraIssueMenu_repoIntegrations
  teamId: string
  userId: string
}

const getValue = (item: {remoteProject?: any; nameWithOwner?: string}) => {
  return item.remoteProject?.name ?? item.nameWithOwner ?? 'Unknown Project'
}

const NewJiraIssueMenu = (props: Props) => {
  const {handleSelectProjectKey, menuProps, repoIntegrations, teamId, userId} = props
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
      ariaLabel='Select Jira project'
      keepParentFocus
      {...menuProps}
      resetActiveOnChanges={[allItems]}
    >
      <SearchMenuItem placeholder='Search Jira' onChange={onQueryChange} value={query} />
      {(query && allItems.length === 0 && status !== 'loading' && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No integrations found!
        </EmptyDropdownMenuItemLabel>
      )) ||
        null}

      {allItems.slice(0, 10).map((repoIntegration) => {
        const {id, __typename} = repoIntegration
        if (__typename === 'JiraRemoteProject') {
          const {key} = repoIntegration
          const onClick = () => {
            handleSelectProjectKey(key)
          }
          return (
            <RepoIntegrationJiraMenuItem
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

export default createFragmentContainer(NewJiraIssueMenu, {
  repoIntegrations: graphql`
    fragment NewJiraIssueMenu_repoIntegrations on RepoIntegrationQueryPayload {
      hasMore
      items {
        ... on JiraRemoteProject {
          __typename
          id
          name
          key
        }
        ... on _xGitHubRepository {
          nameWithOwner
        }
        ...RepoIntegrationJiraMenuItem_repoIntegration
      }
    }
  `
})
