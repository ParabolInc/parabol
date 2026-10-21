import {cn} from '../../../../ui/cn'
import type {OrgTeamsSortDirection, OrgTeamsSortField} from './sortOrgTeams'

interface Props {
  levels: readonly {id: string; name: string}[]
  sortBy: OrgTeamsSortField
  sortDirection: OrgTeamsSortDirection
  onSort: (field: OrgTeamsSortField) => void
}

const SORTABLE_COLUMNS = [
  {field: 'name', label: 'Team', width: 'w-[60%]'},
  {field: 'memberCount', label: 'Member Count', width: 'w-[20%]'},
  {field: 'lastMetAt', label: 'Last Met At', width: 'w-[20%]'}
] as const

// a column per team structure level leaves the table to size its columns
const OrgTeamsTableHeader = ({levels, sortBy, sortDirection, onSort}: Props) => (
  <thead>
    <tr className='border-hairline border-b'>
      {SORTABLE_COLUMNS.map(({field, label, width}) => (
        <th
          key={field}
          className={cn('cursor-pointer p-3 text-left font-semibold', levels.length === 0 && width)}
          onClick={() => onSort(field)}
        >
          {label}
          {sortBy === field && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
        </th>
      ))}
      {levels.map((level) => (
        <th key={level.id} scope='col' className='p-3 text-left font-semibold'>
          {level.name}
        </th>
      ))}
    </tr>
  </thead>
)

export default OrgTeamsTableHeader
