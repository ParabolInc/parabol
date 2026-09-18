import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {AzureDevOpsScopingSearchFilterMenuQuery} from '../__generated__/AzureDevOpsScopingSearchFilterMenuQuery.graphql'
import useSetScopingSearchState from '../hooks/useSetScopingSearchState'
import {
  searchFiltersByKey,
  toggleSearchFilter
} from '../integrations/platform/IntegrationSearchFilter'
import type {ScopingSearchState} from '../integrations/platform/ScopingSearchState'
import {cn} from '../ui/cn'
import {MenuItem} from '../ui/Menu/MenuItem'
import Checkbox from './Checkbox'
import DropdownMenuLabel from './DropdownMenuLabel'

interface Props {
  meetingId: string
  state: ScopingSearchState
  queryRef: PreloadedQuery<AzureDevOpsScopingSearchFilterMenuQuery>
}

const AzureDevOpsScopingSearchFilterMenu = (props: Props) => {
  const {meetingId, state, queryRef} = props
  const data = usePreloadedQuery<AzureDevOpsScopingSearchFilterMenuQuery>(
    graphql`
      query AzureDevOpsScopingSearchFilterMenuQuery($teamId: ID!) {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              azureDevOps {
                projects {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  )
  const projects = data.viewer.teamMember?.integrations.azureDevOps.projects ?? []
  const {isAdvancedQuery, filters} = state
  const projectNames = searchFiltersByKey(filters, 'project')
  const setSearchState = useSetScopingSearchState(meetingId, 'azureDevOps')
  const toggleAdvancedQuery = () => {
    setSearchState({isAdvancedQuery: !isAdvancedQuery, filters: []})
  }
  return (
    <>
      <MenuItem onSelect={(e) => e.preventDefault()} onClick={toggleAdvancedQuery}>
        <Checkbox className='-ml-2 mr-2' active={isAdvancedQuery} />
        <span className='font-semibold'>{'Use WIQL'}</span>
      </MenuItem>

      {projects.length > 0 && (
        <DropdownMenuLabel className='border-b-0'>Filter by project:</DropdownMenuLabel>
      )}
      {projects.map((project) => {
        const {id: projectId, name} = project
        const isSelected = projectNames.includes(name)
        const toggleProjectFilter = () => {
          setSearchState({filters: toggleSearchFilter(filters, 'project', name)})
        }
        return (
          <MenuItem
            key={projectId}
            className={cn(isAdvancedQuery && 'opacity-50')}
            onSelect={(e) => e.preventDefault()}
            onClick={isAdvancedQuery ? undefined : toggleProjectFilter}
            isDisabled={isAdvancedQuery}
          >
            <Checkbox className='-ml-2 mr-2' active={isSelected} disabled={isAdvancedQuery} />
            {name}
          </MenuItem>
        )
      })}
    </>
  )
}

export default AzureDevOpsScopingSearchFilterMenu
