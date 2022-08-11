import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuProps} from '~/hooks/useMenu'
import useSearchFilter from '~/hooks/useSearchFilter'
import {
  NewAzureIssueMenu_AzureDevOpsRemoteProjects,
  NewAzureIssueMenu_AzureDevOpsRemoteProjects$key
} from '../__generated__/NewAzureIssueMenu_AzureDevOpsRemoteProjects.graphql'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import {SearchMenuItem} from './SearchMenuItem'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface Props {
  setSelectedProjectName: (key: string) => void
  menuProps: MenuProps
  teamId: string
  userId: string
  projectsRef: NewAzureIssueMenu_AzureDevOpsRemoteProjects$key
}

const getValue = (project: NewAzureIssueMenu_AzureDevOpsRemoteProjects[0]) => project.name

const NewAzureIssueMenu = (props: Props) => {
  const {setSelectedProjectName, menuProps, projectsRef} = props

  const projects = useFragment(
    graphql`
      fragment NewAzureIssueMenu_AzureDevOpsRemoteProjects on AzureDevOpsRemoteProject
      @relay(plural: true) {
        id
        name
      }
    `,
    projectsRef
  )
  const {
    query,
    filteredItems: filteredProjects,
    onQueryChange
  } = useSearchFilter(projects ?? [], getValue)

  return (
    <Menu
      ariaLabel='Select Azure project'
      keepParentFocus
      {...menuProps}
      resetActiveOnChanges={[projects]}
    >
      <SearchMenuItem placeholder='Search Azure' onChange={onQueryChange} value={query} />
      {query && projects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No projects found!</EmptyDropdownMenuItemLabel>
      )}

      {filteredProjects.slice(0, 10).map((project) => {
        const {id, name} = project
        const onClick = () => {
          setSelectedProjectName(name)
        }
        return (
          <TaskIntegrationMenuItem
            key={id}
            query={query}
            label={name}
            onClick={onClick}
            service='azureDevOps'
          />
        )
      })}
    </Menu>
  )
}

export default NewAzureIssueMenu
