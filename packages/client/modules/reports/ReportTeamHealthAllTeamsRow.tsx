import ReportTeamHealthCell from './ReportTeamHealthCell'
import ReportTeamHealthRowHeader from './ReportTeamHealthRowHeader'
import type {ReportResultKey} from './reportRows'
import type {ReportTeamHealthAllTeams} from './reportTeamHealthRows'

interface Props {
  allTeams: ReportTeamHealthAllTeams
  columns: ReportResultKey[]
  hasAnsweredColumn: boolean
}

// every team together shows no change, since each team is compared with its own check before
const ReportTeamHealthAllTeamsRow = ({allTeams, columns, hasAnsweredColumn}: Props) => {
  const {answered, values, total} = allTeams
  return (
    <tr className='border-hairline-strong border-b'>
      <ReportTeamHealthRowHeader
        name='All teams'
        narrowMeta={answered && `${answered} answered`}
        isBold
      />
      {hasAnsweredColumn && (
        <td className='@3xl:table-cell hidden whitespace-nowrap px-1 text-[13px] text-fg-secondary'>
          {answered}
        </td>
      )}
      {columns.map((column) => (
        <ReportTeamHealthCell
          key={column.value}
          label={`All teams, ${column.label}`}
          value={values.get(column.value)}
          isTotal
        />
      ))}
      <ReportTeamHealthCell label='All teams, overall' value={total} isTotal />
    </tr>
  )
}

export default ReportTeamHealthAllTeamsRow
