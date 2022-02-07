import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAllIntegrations from '~/hooks/useAllIntegrations'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '~/hooks/useMenu'
import useSearchFilter from '~/hooks/useSearchFilter'
import {NewGitHubIssueMenu_suggestedIntegrations} from '~/__generated__/NewGitHubIssueMenu_suggestedIntegrations.graphql'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import {SearchMenuItem} from './SearchMenuItem'
import SuggestedIntegrationGitHubMenuItem from './SuggestedIntegrationGitHubMenuItem'

interface Props {
  handleSelectNameWithOwner: (key: string) => void
  menuProps: MenuProps
  suggestedIntegrations: NewGitHubIssueMenu_suggestedIntegrations
  teamId: string
  userId: string
}

const getValue = (item: {projectName?: string; nameWithOwner?: string}) => {
  return item.projectName || item.nameWithOwner || 'Unknown Project'
}

const NewGitHubIssueMenu = (props: Props) => {
  const {handleSelectNameWithOwner, menuProps, suggestedIntegrations, teamId, userId} = props
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

      {allItems.slice(0, 10).map((suggestedIntegration) => {
        const {id, service} = suggestedIntegration
        if (service === 'github') {
          const {nameWithOwner} = suggestedIntegration
          const onClick = () => {
            handleSelectNameWithOwner(nameWithOwner)
          }
          return (
            <SuggestedIntegrationGitHubMenuItem
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

export default createFragmentContainer(NewGitHubIssueMenu, {
  suggestedIntegrations: graphql`
    fragment NewGitHubIssueMenu_suggestedIntegrations on SuggestedIntegrationQueryPayload {
      hasMore
      items {
        ... on SuggestedIntegrationGitHub {
          id
          nameWithOwner
          service
        }
        ...SuggestedIntegrationGitHubMenuItem_suggestedIntegration
      }
    }
  `
})
