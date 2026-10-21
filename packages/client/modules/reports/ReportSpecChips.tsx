import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {type ReportStepLength, toReportSpecChips} from './reportSpecLabels'

interface Props {
  spec: ReportSpec
  step: ReportStepLength | null | undefined
  teamNames: Map<string, string>
}

const ReportSpecChips = ({spec, step, teamNames}: Props) => {
  const chips = toReportSpecChips(spec, {step, teamNames})
  return (
    <ul
      aria-label='Report settings'
      className='m-0 flex list-none flex-wrap items-center gap-2 p-0'
    >
      {chips.map(({name, value}) => (
        <li
          key={`${name}:${value}`}
          className='inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border border-hairline-strong bg-surface-card px-2.5 text-[13px]'
        >
          <span className='text-fg-secondary'>{name}</span>
          <span className='font-semibold'>{value}</span>
        </li>
      ))}
    </ul>
  )
}

export default ReportSpecChips
