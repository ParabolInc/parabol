import useSearchFilter from '~/hooks/useSearchFilter'
import type {AzureDevOpsSharedProject} from '../integrations/azureDevOps/azureDevOpsSharedProjects'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface Props {
  projects: readonly AzureDevOpsSharedProject[]
  onSelectProject: (integrationRepoId: string) => void
}

export const getAzureProjectLabel = ({organization, name}: AzureDevOpsSharedProject) =>
  `${organization} / ${name}`

const NewAzureIssueMenu = (props: Props) => {
  const {projects, onSelectProject} = props
  const {
    query,
    filteredItems: filteredProjects,
    onQueryChange
  } = useSearchFilter(projects, getAzureProjectLabel)

  return (
    <MenuContent align='start' className='min-w-[300px]'>
      <MenuSearch placeholder='Search Azure' onChange={onQueryChange} value={query} />
      {filteredProjects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No projects found!</EmptyDropdownMenuItemLabel>
      )}
      {filteredProjects.slice(0, 10).map((project) => (
        <TaskIntegrationMenuItem
          key={project.integrationRepoId}
          query={query}
          label={getAzureProjectLabel(project)}
          onClick={() => onSelectProject(project.integrationRepoId)}
          service='azureDevOps'
        />
      ))}
    </MenuContent>
  )
}

export default NewAzureIssueMenu
