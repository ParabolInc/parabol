import useSearchFilter from '~/hooks/useSearchFilter'
import SendClientSideEvent from '~/utils/SendClientSideEvent'
import useAtmosphere from '../hooks/useAtmosphere'
import useScopingSearchState from '../hooks/useScopingSearchState'
import type {ScopingSearchState} from '../integrations/platform/ScopingSearchState'
import {searchFiltersByKey} from '../shared/integrations/IntegrationSearchFilter'
import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import Checkbox from './Checkbox'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  meetingId: string
  state: ScopingSearchState
  projects: readonly {id: string; fullPath: string}[]
}

const MAX_PROJECTS = 10

const getValue = (item: {fullPath?: string}) => {
  return item.fullPath || 'Unknown Project'
}

const GitLabScopingSearchFilterMenu = (props: Props) => {
  const {meetingId, state, projects} = props
  const {filters} = state
  const selectedProjectsIds = searchFiltersByKey(filters, 'project')
  const atmosphere = useAtmosphere()
  const setSearchState = useScopingSearchState(meetingId, 'gitlab')

  const {
    query: searchQuery,
    filteredItems: filteredProjects,
    onQueryChange
  } = useSearchFilter(projects, getValue)
  const visibleProjects = filteredProjects.slice(0, MAX_PROJECTS)

  return (
    <>
      <MenuSearch
        placeholder='Search GitLab projects'
        onChange={onQueryChange}
        value={searchQuery}
      />
      {visibleProjects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No projects found!</EmptyDropdownMenuItemLabel>
      )}
      {visibleProjects.map((project) => {
        const {id: projectId, fullPath} = project
        const isSelected = selectedProjectsIds.includes(projectId)

        const handleClick = () => {
          setSearchState({
            filters: isSelected
              ? filters.filter((filter) => filter.key !== 'project' || filter.value !== projectId)
              : [...filters, {key: 'project', value: projectId}]
          })
          SendClientSideEvent(atmosphere, 'Selected Poker Scope Project Filter', {
            meetingId,
            projectId,
            service: 'gitlab'
          })
        }
        return (
          <MenuItem key={projectId} onSelect={(e) => e.preventDefault()} onClick={handleClick}>
            <Checkbox className='-ml-2 mr-2' active={isSelected} />
            <TypeAheadLabel query={searchQuery} label={fullPath} />
          </MenuItem>
        )
      })}
    </>
  )
}

export default GitLabScopingSearchFilterMenu
