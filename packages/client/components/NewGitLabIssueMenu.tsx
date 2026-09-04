import useSearchFilter from '~/hooks/useSearchFilter'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface Props {
  handleSelectFullPath: (key: string) => void
  gitlabProjects: {id: string; fullPath: string}[]
}

const getValue = (item: {fullPath?: string}) => {
  return item.fullPath || 'Unknown Project'
}

const NewGitLabIssueMenu = (props: Props) => {
  const {handleSelectFullPath, gitlabProjects} = props

  const {
    query,
    filteredItems: filteredProjects,
    onQueryChange
  } = useSearchFilter(gitlabProjects, getValue)

  return (
    <MenuContent align='start' className='min-w-[300px]'>
      <MenuSearch placeholder='Search GitLab' onChange={onQueryChange} value={query} />
      {filteredProjects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No projects found!</EmptyDropdownMenuItemLabel>
      )}
      {filteredProjects.slice(0, 10).map((project) => {
        const {id: projectId, fullPath} = project
        const onClick = () => {
          handleSelectFullPath(fullPath)
        }
        return (
          <TaskIntegrationMenuItem
            key={projectId}
            label={fullPath}
            onClick={onClick}
            query={query}
            service='gitlab'
          />
        )
      })}
    </MenuContent>
  )
}

export default NewGitLabIssueMenu
