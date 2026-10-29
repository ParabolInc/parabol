import {REPORT_MEASURES, type ReportMeasure} from '../../shared/reports/reportCatalog'
import {cn} from '../../ui/cn'
import plural from '../../utils/plural'
import ReportLegendDisclosure from './ReportLegendDisclosure'
import {countShadeRanges, HEALTH_SCORE_SHADES} from './reportHeatmapShades'

interface Props {
  measure: ReportMeasure
  max: number
  emptyTeamNames: string[]
}

const ReportHeatmapLegend = ({measure, max, emptyTeamNames}: Props) => {
  const {kind, label} = REPORT_MEASURES[measure]
  const shades =
    kind === 'score'
      ? HEALTH_SCORE_SHADES.map(({label: shadeLabel, className}) => ({
          label: shadeLabel,
          className
        }))
      : kind === 'count'
        ? [{label: 'None', className: 'border border-hairline'}, ...countShadeRanges(max)]
        : []
  if (shades.length === 0 && emptyTeamNames.length === 0) return null
  const count = emptyTeamNames.length
  return (
    <div className='flex flex-wrap items-start justify-between gap-x-6 gap-y-2 text-fg-secondary text-xs'>
      {count > 0 ? (
        <p className='m-0 min-w-0 flex-1'>
          <span className='font-semibold text-fg-primary'>
            No {label.toLowerCase()} for {count} {plural(count, 'team')}:
          </span>{' '}
          {emptyTeamNames.join(', ')}
        </p>
      ) : (
        <span />
      )}
      {shades.length > 0 && (
        <ReportLegendDisclosure isEndAligned>
          <ul aria-label='Shades' className='m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0'>
            {shades.map(({label: shadeLabel, className}) => (
              <li key={shadeLabel} className='flex items-center gap-1.5'>
                <span className={cn('size-3 rounded-sm', className)} />
                {shadeLabel}
              </li>
            ))}
          </ul>
        </ReportLegendDisclosure>
      )}
    </div>
  )
}

export default ReportHeatmapLegend
