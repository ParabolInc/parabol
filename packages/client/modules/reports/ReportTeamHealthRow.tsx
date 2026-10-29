import {Lock} from '~/ui/icons'
import {MIN_REPORT_HEALTH_RESPONDENTS} from '../../shared/reports/reportCatalog'
import ReportTeamHealthCell from './ReportTeamHealthCell'
import ReportTeamHealthRowHeader from './ReportTeamHealthRowHeader'
import {isHiddenReportValue, type ReportResultKey} from './reportRows'
import {
  hasFallenTwice,
  type ReportTeamHealthCheck,
  type ReportTeamHealthCell as TeamHealthCell,
  toTeamHealthCellKey
} from './reportTeamHealthCells'
import type {ReportTeamHealthRowItem} from './reportTeamHealthRows'
import {formatAnswered, formatCheckDate, toOrdinal} from './reportTeamHealthWords'

interface Props {
  item: ReportTeamHealthRowItem
  columns: ReportResultKey[]
  check: ReportTeamHealthCheck | undefined
  cells: ReadonlyMap<string, TeamHealthCell>
  isPreviousCheck: boolean
  selectedKey: string | null
  onSelect: (key: string) => void
}

const ReportTeamHealthRow = (props: Props) => {
  const {item, columns, check, cells, isPreviousCheck, selectedKey, onSelect} = props
  const {name, row, teamId, isNested} = item
  const isHidden =
    !!teamId && [...row.cells.values()].every(({value}) => isHiddenReportValue(value))
  return (
    <tr className='border-hairline border-b'>
      <ReportTeamHealthRowHeader
        name={name}
        narrowMeta={check && `${formatCheckDate(check.endedAt)} · ${formatAnswered(check)}`}
        wideMeta={
          check && `${toOrdinal(check.checkNumber)} check · ${formatCheckDate(check.endedAt)}`
        }
        isNested={isNested}
      />
      {!!teamId && (
        <td className='@3xl:table-cell hidden whitespace-nowrap px-1 text-[13px] text-fg-secondary'>
          {check && formatAnswered(check)}
        </td>
      )}
      {isHidden ? (
        <td colSpan={columns.length + 1} className='px-0.5 py-1'>
          <span className='flex min-h-10 items-center gap-2 rounded border border-hairline-strong border-dashed px-3 py-1 text-[13px] text-fg-secondary'>
            <Lock className='text-[18px]' />
            Hidden for anonymity: fewer than {MIN_REPORT_HEALTH_RESPONDENTS} people answered
          </span>
        </td>
      ) : (
        <>
          {columns.map((column) => {
            const key = teamId ? toTeamHealthCellKey(teamId, column.value) : null
            const value = row.cells.get(column.value)
            const cell = key ? cells.get(key) : undefined
            return (
              <ReportTeamHealthCell
                key={column.value}
                label={`${name}, ${column.label}`}
                value={value}
                cell={cell}
                isFellTwice={
                  isPreviousCheck &&
                  hasFallenTwice(value?.value ?? null, cell?.category.previousScores ?? [])
                }
                isSelected={!!key && key === selectedKey}
                onSelect={key ? () => onSelect(key) : undefined}
              />
            )
          })}
          <ReportTeamHealthCell label={`${name}, overall`} value={row.total ?? undefined} isTotal />
        </>
      )}
    </tr>
  )
}

export default ReportTeamHealthRow
