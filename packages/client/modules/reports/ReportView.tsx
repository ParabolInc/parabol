import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ReportTeamHealthView_teamHealth$key} from '../../__generated__/ReportTeamHealthView_teamHealth.graphql'
import type {ReportView_result$key} from '../../__generated__/ReportView_result.graphql'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportBarsView from './ReportBarsView'
import ReportFlowView from './ReportFlowView'
import ReportHeatmapView from './ReportHeatmapView'
import ReportLineView from './ReportLineView'
import ReportNumberView from './ReportNumberView'
import ReportTableSummary from './ReportTableSummary'
import ReportTableView from './ReportTableView'
import ReportTeamHealthView from './ReportTeamHealthView'
import {withoutHiddenValues} from './reportRows'
import {formatReportBreakdown} from './reportSpecLabels'

interface Props {
  spec: ReportSpec
  resultRef: ReportView_result$key
  // a card on the Reports page, rather than the report's own page
  isCompact?: boolean
  lastHeldByTeamId?: ReadonlyMap<string, number | null>
  // a Health score heatmap by team and category marks its cells, and a cell opens for its details
  orgId?: string
  teamHealthRef?: ReportTeamHealthView_teamHealth$key | null
}

const ReportView = (props: Props) => {
  const {spec, resultRef, isCompact = false, lastHeldByTeamId, orgId, teamHealthRef} = props
  const result = useFragment(
    graphql`
      fragment ReportView_result on ReportResult {
        step
        breakdown {
          dimension
          levelName
        }
        rows {
          keys {
            value
            label
            isPartial
          }
          values
          previousValues
        }
        rowTotals {
          keys {
            value
          }
          values
          previousValues
        }
        notes {
          kind
        }
      }
    `,
    resultRef
  )
  const {step, rows, rowTotals, notes} = result
  const breakdownNames = result.breakdown.map((item) => formatReportBreakdown(item, step))
  if (notes.some(({kind}) => kind === 'FILTER_LEVEL_REMOVED')) {
    return (
      <p className='m-0 py-6 text-center text-fg-secondary text-sm'>
        A team structure level this report filters by was removed, so the report stops here rather
        than count every team. Remove that filter to run it.
      </p>
    )
  }
  if (rows.length === 0) {
    return <p className='m-0 py-6 text-center text-fg-muted text-sm'>Nothing to show</p>
  }
  if (spec.showAs === 'NUMBER') {
    return <ReportNumberView spec={spec} rows={withoutHiddenValues(rows)} isCompact={isCompact} />
  }
  if (spec.showAs === 'LINE') {
    return (
      <ReportLineView
        spec={spec}
        step={step}
        rows={withoutHiddenValues(rows)}
        isCompact={isCompact}
      />
    )
  }
  if (spec.showAs === 'BARS') {
    return (
      <ReportBarsView
        spec={spec}
        step={step}
        rows={withoutHiddenValues(rows)}
        isCompact={isCompact}
      />
    )
  }
  if (spec.showAs === 'HEATMAP' && orgId && teamHealthRef) {
    return (
      <ReportTeamHealthView
        orgId={orgId}
        spec={spec}
        rowHeading={breakdownNames[breakdownNames.length - 2] ?? 'Team'}
        rows={rows}
        rowTotals={rowTotals}
        teamHealthRef={teamHealthRef}
      />
    )
  }
  if (spec.showAs === 'HEATMAP') {
    return (
      <ReportHeatmapView
        spec={spec}
        step={step}
        rows={rows}
        rowTotals={rowTotals}
        isCompact={isCompact}
        lastHeldByTeamId={lastHeldByTeamId}
      />
    )
  }
  if (spec.showAs === 'FLOW')
    return (
      <ReportFlowView
        spec={spec}
        breakdownNames={breakdownNames}
        rows={withoutHiddenValues(rows)}
        isCompact={isCompact}
      />
    )
  return isCompact ? (
    <ReportTableSummary spec={spec} step={step} rows={rows} />
  ) : (
    <ReportTableView spec={spec} breakdownNames={breakdownNames} step={step} rows={rows} />
  )
}

export default ReportView
