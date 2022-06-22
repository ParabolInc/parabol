import React from 'react'
import {Repo} from '~/hooks/useGetRepoContributions'
import {MenuProps} from '~/hooks/useMenu'
import useSearchFilter from '~/hooks/useSearchFilter'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import RepoIntegrationGitHubMenuItem from './RepoIntegrationGitHubMenuItem'
import {SearchMenuItem} from './SearchMenuItem'

interface Props {
  handleSelectNameWithOwner: (key: string) => void
  menuProps: MenuProps
  repos: Repo[]
  teamId: string
  userId: string
}

const getValue = (item: {nameWithOwner?: string}) => {
  return item.nameWithOwner || 'Unknown repo'
}

const NewGitHubIssueMenu = (props: Props) => {
  const {handleSelectNameWithOwner, menuProps, repos} = props

  const {
    query,
    filteredItems: filteredIntegrations,
    onQueryChange
  } = useSearchFilter(repos ?? [], getValue)

  return (
    <Menu
      ariaLabel='Select GitHub project'
      keepParentFocus
      {...menuProps}
      resetActiveOnChanges={[filteredIntegrations]}
    >
      <SearchMenuItem placeholder='Search GitHub' onChange={onQueryChange} value={query} />
      {query && filteredIntegrations.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No repos found!</EmptyDropdownMenuItemLabel>
      )}
      {filteredIntegrations.slice(0, 10).map((repo) => {
        const {nameWithOwner} = repo
        if (!nameWithOwner) return null
        const onClick = () => {
          handleSelectNameWithOwner(nameWithOwner)
        }
        return (
          <RepoIntegrationGitHubMenuItem
            key={nameWithOwner}
            query={query}
            nameWithOwner={nameWithOwner}
            onClick={onClick}
          />
        )
      })}
    </Menu>
  )
}

export default NewGitHubIssueMenu
