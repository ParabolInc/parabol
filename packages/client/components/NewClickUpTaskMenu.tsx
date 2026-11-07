import useSearchFilter from '~/hooks/useSearchFilter'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface ClickUpList {
  id: string
  name: string
  integrationRepoId: string
}

interface Props {
  lists: readonly ClickUpList[]
  onSelectList: (integrationRepoId: string) => void
}

const getValue = (list: {name: string}) => list.name

const NewClickUpTaskMenu = (props: Props) => {
  const {lists, onSelectList} = props
  const {query, filteredItems: filteredLists, onQueryChange} = useSearchFilter(lists, getValue)

  return (
    <MenuContent align='start' className='min-w-[300px]'>
      <MenuSearch placeholder='Search ClickUp lists' onChange={onQueryChange} value={query} />
      {filteredLists.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No lists found!</EmptyDropdownMenuItemLabel>
      )}
      {filteredLists.slice(0, 10).map(({id, name, integrationRepoId}) => (
        <TaskIntegrationMenuItem
          key={id}
          query={query}
          label={name}
          onClick={() => onSelectList(integrationRepoId)}
          service='clickup'
        />
      ))}
    </MenuContent>
  )
}

export default NewClickUpTaskMenu
