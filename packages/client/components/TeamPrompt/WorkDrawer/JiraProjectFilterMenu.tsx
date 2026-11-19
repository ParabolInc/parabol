import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {JiraProjectFilterMenuQuery} from '../../../__generated__/JiraProjectFilterMenuQuery.graphql'
import useSearchFilter from '../../../hooks/useSearchFilter'
import {MenuItem} from '../../../ui/Menu/MenuItem'
import {MenuSearch} from '../../../ui/Menu/MenuSearch'
import Checkbox from '../../Checkbox'
import {EmptyDropdownMenuItemLabel} from '../../EmptyDropdownMenuItemLabel'
import HighlightedText from '../../HighlightedText'

interface Props {
  queryRef: PreloadedQuery<JiraProjectFilterMenuQuery>
  selectedProjectIds: string[]
  setSelectedProjectIds: (projectIds: string[]) => void
}

const getProjectName = (project: {name: string}) => project.name

const MAX_PROJECTS = 10

const JiraProjectFilterMenu = (props: Props) => {
  const {queryRef, selectedProjectIds, setSelectedProjectIds} = props
  const data = usePreloadedQuery<JiraProjectFilterMenuQuery>(
    graphql`
      query JiraProjectFilterMenuQuery($teamId: ID!) {
        viewer {
          teamMember(teamId: $teamId) {
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
        }
      }
    `,
    queryRef
  )
  const projects = data.viewer.teamMember?.integrations.atlassian?.projects ?? []
  const {query, filteredItems, onQueryChange} = useSearchFilter(projects, getProjectName)
  const selectedCount = selectedProjectIds.length
  const selectedProjects = projects.filter(({id}) => selectedProjectIds.includes(id))
  const visibleProjects = Array.from(new Set([...selectedProjects, ...filteredItems])).slice(
    0,
    Math.max(MAX_PROJECTS, selectedCount + 1)
  )

  return (
    <>
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
            <HighlightedText query={query} text={name} className='truncate' />
          </MenuItem>
        )
      })}
    </>
  )
}

export default JiraProjectFilterMenu
