import {MenuProps} from '~/hooks/useMenu'
import useSearchFilter from '~/hooks/useSearchFilter'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import {SearchMenuItem} from './SearchMenuItem'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface Props {
  handleSelectProject: (item: {id: string; name: string}) => void
  menuProps: MenuProps
  linearProjects: {id: string; name: string}[]
}

const getValue = (item: {name?: string}) => {
  return item.name || 'Unknown Project'
}

const NewLinearIssueMenu = (props: Props) => {
  const {handleSelectProject, menuProps, linearProjects} = props

  const {
    query,
    filteredItems: filteredProjects,
    onQueryChange
  } = useSearchFilter(linearProjects, getValue)

  return (
    <Menu ariaLabel='Select Linear project' keepParentFocus {...menuProps}>
      <SearchMenuItem placeholder='Search Linear' onChange={onQueryChange} value={query} />
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
    </Menu>
  )
}

export default NewLinearIssueMenu
