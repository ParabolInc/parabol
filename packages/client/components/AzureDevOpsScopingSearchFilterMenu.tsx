import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import type {AzureDevOpsScopingSearchFilterMenuQuery} from '../__generated__/AzureDevOpsScopingSearchFilterMenuQuery.graphql'
import useScopingSearchState from '../hooks/useScopingSearchState'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import {searchFiltersByKey} from '../shared/integrations/IntegrationSearchFilter'
import {cn} from '../ui/cn'
import {MenuItem} from '../ui/Menu/MenuItem'
import Checkbox from './Checkbox'
import DropdownMenuLabel from './DropdownMenuLabel'

const query = graphql`
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
`

const AzureDevOpsScopingSearchFilterMenu = (props: FilterMenuProps) => {
  const {meetingId, teamId, state} = props
  const data = useLazyLoadQuery<AzureDevOpsScopingSearchFilterMenuQuery>(
    query,
    {teamId},
    {fetchPolicy: 'store-or-network'}
  )
  const projects = data.viewer.teamMember?.integrations.azureDevOps.projects ?? []
  const {isAdvancedQuery, filters} = state
  const projectNames = searchFiltersByKey(filters, 'project')
  const setSearchState = useScopingSearchState(meetingId, 'azureDevOps')
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
          setSearchState({
            filters: isSelected
              ? filters.filter((filter) => filter.key !== 'project' || filter.value !== name)
              : [...filters, {key: 'project', value: name}]
          })
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
