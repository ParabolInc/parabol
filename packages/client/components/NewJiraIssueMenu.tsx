import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAllIntegrations from '~/hooks/useAllIntegrations'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '~/hooks/useMenu'
import useSearchFilter from '~/hooks/useSearchFilter'
import {NewJiraIssueMenu_suggestedIntegrations} from '~/__generated__/NewJiraIssueMenu_suggestedIntegrations.graphql'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import {SearchMenuItem} from './SearchMenuItem'
import SuggestedIntegrationJiraMenuItem from './SuggestedIntegrationJiraMenuItem'

interface Props {
  handleSelectProjectKey: (key: string) => void
  menuProps: MenuProps
  suggestedIntegrations: NewJiraIssueMenu_suggestedIntegrations
  teamId: string
  userId: string
}

const getValue = (item: {remoteProject?: any; nameWithOwner?: string}) => {
  return item.remoteProject?.name ?? item.nameWithOwner ?? 'Unknown Project'
}

const NewJiraIssueMenu = (props: Props) => {
  const {handleSelectProjectKey, menuProps, suggestedIntegrations, teamId, userId} = props
  const {hasMore, items} = suggestedIntegrations

  const {
    query,
    filteredItems: filteredIntegrations,
    onQueryChange
  } = useSearchFilter(items ?? [], getValue)

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

      {allItems.slice(0, 10).map((suggestedIntegration) => {
        const {id, service} = suggestedIntegration
        if (service === 'jira') {
          const {projectKey} = suggestedIntegration
          const onClick = () => {
            handleSelectProjectKey(projectKey)
          }
          return (
            <SuggestedIntegrationJiraMenuItem
              key={id}
              query={query}
              suggestedIntegration={suggestedIntegration}
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
  suggestedIntegrations: graphql`
    fragment NewJiraIssueMenu_suggestedIntegrations on SuggestedIntegrationQueryPayload {
      hasMore
      items {
        ... on SuggestedIntegrationJira {
          id
          projectKey
          service
          remoteProject {
            name
          }
        }
        ...SuggestedIntegrationJiraMenuItem_suggestedIntegration
      }
    }
  `
})
