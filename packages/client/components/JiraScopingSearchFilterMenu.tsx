import {useMemo} from 'react'
import useSearchFilter from '~/hooks/useSearchFilter'
import useSetScopingSearchState from '../hooks/useSetScopingSearchState'
import {
  searchFiltersByKey,
  toggleSearchFilter
} from '../integrations/platform/IntegrationSearchFilter'
import type {ScopingSearchState} from '../integrations/platform/ScopingSearchState'
import {cn} from '../ui/cn'
import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import {MenuSeparator} from '../ui/Menu/MenuSeparator'
import Checkbox from './Checkbox'
import DropdownMenuLabel from './DropdownMenuLabel'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TypeAheadLabel from './TypeAheadLabel'

type Project = {
  id: string
  name: string
  avatar: string | null | undefined
}

interface Props {
  meetingId: string
  projects: readonly Project[]
  state: ScopingSearchState
  service: 'jira' | 'jiraServer'
}

const getValue = (item: {name: string}) => item.name

const MAX_PROJECTS = 10

// Reusable for both Jira and Jira Server/Data Center.
const JiraScopingSearchFilterMenu = (props: Props) => {
  const {projects, meetingId, state, service} = props
  const {isAdvancedQuery, filters} = state
  const projectIds = searchFiltersByKey(filters, 'project')
  const setSearchState = useSetScopingSearchState(meetingId, service)

  const {
    query,
    filteredItems: queryFilteredProjects,
    onQueryChange
  } = useSearchFilter(projects, getValue)

  const showSearch = projects.length > MAX_PROJECTS
  const selectedAndFilteredProjects = useMemo(() => {
    const selectedProjects = projects.filter((project) => projectIds.includes(project.id))
    const adjustedMax =
      selectedProjects.length >= MAX_PROJECTS ? selectedProjects.length + 1 : MAX_PROJECTS
    return Array.from(new Set([...selectedProjects, ...queryFilteredProjects])).slice(
      0,
      adjustedMax
    )
  }, [queryFilteredProjects])

  const toggleAdvancedQuery = () => {
    setSearchState({isAdvancedQuery: !isAdvancedQuery, filters: []})
  }
  return (
    <>
      <MenuItem onSelect={(e) => e.preventDefault()} onClick={toggleAdvancedQuery}>
        <Checkbox className='-ml-2 mr-2' active={isAdvancedQuery} />
        <span className='font-semibold'>{'Use JQL'}</span>
      </MenuItem>
      <MenuSeparator />
      {selectedAndFilteredProjects.length > 0 && (
        <DropdownMenuLabel className='border-b-0'>Filter by project:</DropdownMenuLabel>
      )}
      {showSearch && (
        <MenuSearch placeholder='Search Jira' onChange={onQueryChange} value={query} />
      )}
      {(query && selectedAndFilteredProjects.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No Jira Projects found!
        </EmptyDropdownMenuItemLabel>
      )) ||
        null}
      {selectedAndFilteredProjects.map((project) => {
        const {id: globalProjectKey, avatar, name} = project
        const isSelected = projectIds.includes(globalProjectKey)
        const toggleProjectFilter = () => {
          setSearchState({filters: toggleSearchFilter(filters, 'project', globalProjectKey)})
        }
        return (
          <MenuItem
            key={globalProjectKey}
            className={cn(isAdvancedQuery && 'opacity-50')}
            onSelect={(e) => e.preventDefault()}
            onClick={isAdvancedQuery ? undefined : toggleProjectFilter}
            isDisabled={isAdvancedQuery}
          >
            <Checkbox className='-ml-2 mr-2' active={isSelected} disabled={isAdvancedQuery} />
            <img className='mr-2 h-6 w-6' src={avatar || undefined} />
            <TypeAheadLabel query={query} label={name} />
          </MenuItem>
        )
      })}
    </>
  )
}

export default JiraScopingSearchFilterMenu
