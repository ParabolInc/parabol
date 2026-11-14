import {cn} from '../../ui/cn'
import ReportHeatmapGroupLabel from './ReportHeatmapGroupLabel'
import ReportTeamHealthAllTeamsRow from './ReportTeamHealthAllTeamsRow'
import ReportTeamHealthRow from './ReportTeamHealthRow'
import type {ReportResultKey} from './reportRows'
import type {ReportTeamHealthCell, ReportTeamHealthCheck} from './reportTeamHealthCells'
import type {ReportTeamHealthAllTeams, ReportTeamHealthRowGroup} from './reportTeamHealthRows'

interface Props {
  columns: ReportResultKey[]
  rowHeading: string
  // team rows say how many answered each check; rows of team structure alone can't
  hasAnsweredColumn: boolean
  allTeams: ReportTeamHealthAllTeams
  groups: ReportTeamHealthRowGroup[]
  checkByTeamId: ReadonlyMap<string, ReportTeamHealthCheck>
  cells: ReadonlyMap<string, ReportTeamHealthCell>
  selectedKey: string | null
  onSelect: (key: string) => void
}

const HEADING_CLASS_NAME = 'px-1 pt-1 pb-1.5 text-left align-bottom font-semibold'

const ReportTeamHealthTable = (props: Props) => {
  const {columns, rowHeading, hasAnsweredColumn, allTeams, groups, checkByTeamId, cells} = props
  const {selectedKey, onSelect} = props
  return (
    <div className='overflow-x-auto'>
      <table
        aria-label={`Health score by ${rowHeading.toLowerCase()} and category`}
        className='w-full border-collapse text-sm tabular-nums'
      >
        <thead>
          <tr className='border-hairline-strong border-b @3xl:text-[13px] text-[12px] text-fg-secondary'>
            <th
              scope='col'
              className='sticky left-0 z-10 bg-surface-card pt-1 pr-2 pb-1.5 text-left align-bottom font-semibold'
            >
              {rowHeading}
            </th>
            {hasAnsweredColumn && (
              <th scope='col' className={cn('@3xl:table-cell hidden', HEADING_CLASS_NAME)}>
                Answered
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.value}
                scope='col'
                className={cn('@3xl:min-w-28 min-w-19', HEADING_CLASS_NAME)}
              >
                {column.label}
              </th>
            ))}
            <th
              scope='col'
              className={cn('@3xl:min-w-28 min-w-19 text-fg-primary', HEADING_CLASS_NAME)}
            >
              Overall
            </th>
          </tr>
        </thead>
        <tbody>
          <ReportTeamHealthAllTeamsRow
            allTeams={allTeams}
            columns={columns}
            hasAnsweredColumn={hasAnsweredColumn}
          />
        </tbody>
        {groups.map(({id, label, items}) => (
          <tbody key={id}>
            {label !== null && (
              <ReportHeatmapGroupLabel
                label={label}
                colSpan={2 + Number(hasAnsweredColumn) + columns.length}
              />
            )}
            {items.map((item) => (
              <ReportTeamHealthRow
                key={item.id}
                item={item}
                columns={columns}
                check={item.teamId ? checkByTeamId.get(item.teamId) : undefined}
                cells={cells}
                selectedKey={selectedKey}
                onSelect={onSelect}
              />
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}

export default ReportTeamHealthTable
