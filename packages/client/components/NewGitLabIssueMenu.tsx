import React from 'react'
import {MenuProps} from '~/hooks/useMenu'
import useSearchFilter from '~/hooks/useSearchFilter'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import GitLabMenuItem from './GitLabMenuItem'
import Menu from './Menu'
import {SearchMenuItem} from './SearchMenuItem'

interface Props {
  handleSelectFullPath: (key: string) => void
  menuProps: MenuProps
  gitlabProjects: {id: string; fullPath: string}[]
}

const getValue = (item: {fullPath?: string}) => {
  return item.fullPath || 'Unknown Project'
}

const NewGitLabIssueMenu = (props: Props) => {
  const {handleSelectFullPath, menuProps, gitlabProjects} = props

  const {
    query,
    filteredItems: filteredProjects,
    onQueryChange
  } = useSearchFilter(gitlabProjects, getValue)

  return (
    <Menu ariaLabel='Select GitLab project' keepParentFocus {...menuProps}>
      <SearchMenuItem placeholder='Search GitLab' onChange={onQueryChange} value={query} />
      {filteredProjects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No projects found!</EmptyDropdownMenuItemLabel>
      )}
      {filteredProjects.slice(0, 10).map((project) => {
        const {id: projectId, fullPath} = project
        const onClick = () => {
          handleSelectFullPath(fullPath)
        }
        return (
          <GitLabMenuItem key={projectId} fullPath={fullPath} onClick={onClick} query={query} />
        )
      })}
    </Menu>
  )
}

export default NewGitLabIssueMenu
