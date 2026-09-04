import {useMemo} from 'react'
import {commitLocalUpdate} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import useAtmosphere from '../hooks/useAtmosphere'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import {cn} from '../ui/cn'
import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import {MenuSeparator} from '../ui/Menu/MenuSeparator'
import Checkbox from './Checkbox'
import DropdownMenuLabel from './DropdownMenuLabel'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import MockFieldList from './MockFieldList'
import TypeAheadLabel from './TypeAheadLabel'

type JiraSearchQuery = {
  readonly isJQL: boolean
  readonly projectKeyFilters: readonly string[]
}

type Project = {
  id: string
  name: string
  avatar: string | null | undefined
}

interface Props {
  meetingId: string
  projects: readonly Project[]
  jiraSearchQuery: JiraSearchQuery | null
  service: 'jira' | 'jiraServer'
}

const getValue = (item: {name: string}) => item.name

const MAX_PROJECTS = 10

// Reusable for both Jira and Jira Server/Data Center.
const JiraScopingSearchFilterMenu = (props: Props) => {
  const {projects, meetingId, jiraSearchQuery, service} = props
  const isLoading = meetingId === null
  const projectKeyFilters = jiraSearchQuery?.projectKeyFilters ?? []
  const isJQL = jiraSearchQuery?.isJQL ?? false

  const {
    query,
    filteredItems: queryFilteredProjects,
    onQueryChange
  } = useSearchFilter(projects, getValue)

  const showSearch = projects.length > MAX_PROJECTS
  const selectedAndFilteredProjects = useMemo(() => {
    const selectedProjects = projects.filter((project) => projectKeyFilters.includes(project.id))
    const adjustedMax =
      selectedProjects.length >= MAX_PROJECTS ? selectedProjects.length + 1 : MAX_PROJECTS
    return Array.from(new Set([...selectedProjects, ...queryFilteredProjects])).slice(
      0,
      adjustedMax
    )
  }, [queryFilteredProjects])

  const atmosphere = useAtmosphere()
  const toggleJQL = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const searchQueryId = SearchQueryId.join(service, meetingId)
      const jiraSearchQuery = store.get(searchQueryId)
      // this might bork if the checkbox is ticked before the full query loads
      if (!jiraSearchQuery) return
      jiraSearchQuery.setValue(!isJQL, 'isJQL')
      jiraSearchQuery.setValue([], 'projectKeyFilters')
    })
  }
  return (
    <>
      <MenuItem onSelect={(e) => e.preventDefault()} onClick={toggleJQL}>
        <Checkbox className='-ml-2 mr-2' active={isJQL} />
        <span className='font-semibold'>{'Use JQL'}</span>
      </MenuItem>
      <MenuSeparator />
      {isLoading && <MockFieldList />}
      {selectedAndFilteredProjects.length > 0 && (
        <DropdownMenuLabel className='border-b-0'>Filter by project:</DropdownMenuLabel>
      )}
      {showSearch && (
        <MenuSearch placeholder='Search Jira' onChange={onQueryChange} value={query} />
      )}
      {(query && selectedAndFilteredProjects.length === 0 && !isLoading && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No Jira Projects found!
        </EmptyDropdownMenuItemLabel>
      )) ||
        null}
      {selectedAndFilteredProjects.map((project) => {
        const {id: globalProjectKey, avatar, name} = project
        const toggleProjectKeyFilter = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const searchQueryId = SearchQueryId.join(service, meetingId)
            const jiraSearchQuery = store.get<JiraSearchQuery>(searchQueryId)!
            const projectKeyFiltersProxy = jiraSearchQuery.getValue('projectKeyFilters')!.slice()
            const keyIdx = projectKeyFiltersProxy.indexOf(globalProjectKey)
            if (keyIdx !== -1) {
              projectKeyFiltersProxy.splice(keyIdx, 1)
            } else {
              projectKeyFiltersProxy.push(globalProjectKey)
            }
            jiraSearchQuery.setValue(projectKeyFiltersProxy, 'projectKeyFilters')
          })
        }
        return (
          <MenuItem
            key={globalProjectKey}
            className={cn(isJQL && 'opacity-50')}
            onSelect={(e) => e.preventDefault()}
            onClick={isJQL ? undefined : toggleProjectKeyFilter}
            isDisabled={isJQL}
          >
            <Checkbox
              className='-ml-2 mr-2'
              active={projectKeyFilters.includes(globalProjectKey)}
              disabled={isJQL}
            />
            <img className='mr-2 h-6 w-6' src={avatar || undefined} />
            <TypeAheadLabel query={query} label={name} />
          </MenuItem>
        )
      })}
    </>
  )
}

export default JiraScopingSearchFilterMenu
