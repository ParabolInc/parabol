import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ExpandMore, FilterList} from '~/ui/icons'
import type {JiraProjectFilterBar_teamMember$key} from '../../../__generated__/JiraProjectFilterBar_teamMember.graphql'
import useSearchFilter from '../../../hooks/useSearchFilter'
import {cn} from '../../../ui/cn'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../ui/Menu/MenuItem'
import {MenuSearch} from '../../../ui/Menu/MenuSearch'
import plural from '../../../utils/plural'
import Checkbox from '../../Checkbox'
import {EmptyDropdownMenuItemLabel} from '../../EmptyDropdownMenuItemLabel'
import TypeAheadLabel from '../../TypeAheadLabel'

interface Props {
  teamMemberRef: JiraProjectFilterBar_teamMember$key
  selectedProjectIds: string[]
  setSelectedProjectIds: (projectIds: string[]) => void
}

const getProjectName = (project: {name: string}) => project.name

const MAX_PROJECTS = 10

const JiraProjectFilterBar = (props: Props) => {
  const {teamMemberRef, selectedProjectIds, setSelectedProjectIds} = props
  const teamMember = useFragment(
    graphql`
      fragment JiraProjectFilterBar_teamMember on TeamMember {
        integrations {
          atlassian {
            projects {
              id
              name
              avatar
            }
          }
        }
      }
    `,
    teamMemberRef
  )
  const projects = teamMember.integrations.atlassian?.projects ?? []
  const {query, filteredItems, onQueryChange} = useSearchFilter(projects, getProjectName)
  const selectedCount = selectedProjectIds.length
  const selectedProjects = projects.filter(({id}) => selectedProjectIds.includes(id))
  const visibleProjects = Array.from(new Set([...selectedProjects, ...filteredItems])).slice(
    0,
    Math.max(MAX_PROJECTS, selectedCount + 1)
  )

  return (
    <Menu
      trigger={
        <button className='group flex cursor-pointer items-center gap-2 rounded-sm border border-hairline border-solid bg-surface-card px-3 py-0.5 text-left transition hover:border-hairline-strong data-[state=open]:border-accent'>
          <FilterList className='h-5 w-5 text-fg-secondary' />
          {selectedCount === 0
            ? 'All projects'
            : `${selectedCount} ${plural(selectedCount, 'project')} selected`}
          <ExpandMore
            className={cn(
              'ml-auto rounded-full transition duration-300 group-data-[state=open]:rotate-180',
              selectedCount > 0 &&
                'group-data-[state=closed]:bg-accent group-data-[state=closed]:text-white'
            )}
          />
        </button>
      }
    >
      <MenuContent align='start' className='max-h-80 w-(--radix-dropdown-menu-trigger-width) pt-2'>
        <MenuSearch placeholder='Search Jira projects' onChange={onQueryChange} value={query} />
        {visibleProjects.length === 0 && (
          <EmptyDropdownMenuItemLabel>No projects found!</EmptyDropdownMenuItemLabel>
        )}
        {visibleProjects.map(({id: projectId, name, avatar}) => {
          const isSelected = selectedProjectIds.includes(projectId)
          return (
            <MenuItem
              key={projectId}
              onSelect={(e) => e.preventDefault()}
              onClick={() =>
                setSelectedProjectIds(
                  isSelected
                    ? selectedProjectIds.filter((id) => id !== projectId)
                    : [...selectedProjectIds, projectId]
                )
              }
            >
              <Checkbox className='-ml-2 mr-2' active={isSelected} />
              {avatar && <img className='mr-2 size-5 rounded-sm' src={avatar} alt='' />}
              <TypeAheadLabel query={query} label={name} />
            </MenuItem>
          )
        })}
      </MenuContent>
    </Menu>
  )
}

export default JiraProjectFilterBar
