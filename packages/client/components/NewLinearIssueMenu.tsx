import useSearchFilter from '~/hooks/useSearchFilter'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface Props {
  handleSelectProject: (item: {id: string; name: string}) => void
  linearProjects: {id: string; name: string}[]
}

const getValue = (item: {name?: string}) => {
  return item.name || 'Unknown Project'
}

const NewLinearIssueMenu = (props: Props) => {
  const {handleSelectProject, linearProjects} = props

  const {
    query,
    filteredItems: filteredProjects,
    onQueryChange
  } = useSearchFilter(linearProjects, getValue)

  return (
    <MenuContent align='start' className='min-w-[300px]'>
      <MenuSearch placeholder='Search Linear' onChange={onQueryChange} value={query} />
      {filteredProjects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No projects found!</EmptyDropdownMenuItemLabel>
      )}
      {filteredProjects.slice(0, 10).map((project) => {
        const {id: projectId, name} = project
        const onClick = () => {
          handleSelectProject({id: projectId, name})
        }
        return (
          <TaskIntegrationMenuItem
            key={projectId}
            label={name}
            onClick={onClick}
            query={query}
            service='linear'
          />
        )
      })}
    </MenuContent>
  )
}

export default NewLinearIssueMenu
