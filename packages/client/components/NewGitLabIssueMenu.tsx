import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {
  createFragmentContainer,
  readInlineData,
  useFragment,
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
  gitlabProjects: any
}

const getValue = (item: {fullPath?: string}) => {
  return item.fullPath || 'Unknown Project'
}

const NewGitLabIssueMenu = (props: Props) => {
  const {handleSelectFullPath, menuProps, gitlabProjects} = props

  const {query, filteredItems: filteredProjects, onQueryChange} = useSearchFilter(
    gitlabProjects,
    getValue
  )
  console.log('🚀  ~ filteredProjects', {filteredProjects, gitlabProjects})

  const onClick = (fullPath: string) => {
    handleSelectFullPath(fullPath)
  }

  return (
    <Menu ariaLabel='Select GitLab project' keepParentFocus {...menuProps}>
      <SearchMenuItem placeholder='Search GitLab' onChange={onQueryChange} />
      {filteredProjects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No projects found!</EmptyDropdownMenuItemLabel>
      )}
      {filteredProjects.map((project) => (
        <RepoIntegrationGitLabMenuItem
          key={project.id}
          fullPath={project.fullPath}
          onClick={onClick}
          query={query}
        />
      ))}
    </Menu>
  )
}

export default NewGitLabIssueMenu
