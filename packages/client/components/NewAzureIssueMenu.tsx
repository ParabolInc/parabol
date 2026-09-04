import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import type {
  NewAzureIssueMenu_AzureDevOpsRemoteProjects$data,
  NewAzureIssueMenu_AzureDevOpsRemoteProjects$key
} from '../__generated__/NewAzureIssueMenu_AzureDevOpsRemoteProjects.graphql'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface Props {
  setSelectedProjectName: (key: string) => void
  projectsRef: NewAzureIssueMenu_AzureDevOpsRemoteProjects$key
}

const getValue = (project: NewAzureIssueMenu_AzureDevOpsRemoteProjects$data[0]) => project.name

const NewAzureIssueMenu = (props: Props) => {
  const {setSelectedProjectName, projectsRef} = props

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
    <MenuContent align='start' className='min-w-[300px]'>
      <MenuSearch placeholder='Search Azure' onChange={onQueryChange} value={query} />
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
    </MenuContent>
  )
}

export default NewAzureIssueMenu
