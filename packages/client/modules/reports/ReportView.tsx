import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ReportView_result$key} from '../../__generated__/ReportView_result.graphql'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportBarsView from './ReportBarsView'
import ReportHeatmapView from './ReportHeatmapView'
import ReportLineView from './ReportLineView'
import ReportNumberView from './ReportNumberView'
import ReportTableSummary from './ReportTableSummary'
import ReportTableView from './ReportTableView'

interface Props {
  spec: ReportSpec
  resultRef: ReportView_result$key
  // a card on the Reports page, rather than the report's own page
  isCompact?: boolean
}

const ReportView = ({spec, resultRef, isCompact = false}: Props) => {
  const result = useFragment(
    graphql`
      fragment ReportView_result on ReportResult {
        step
        rows {
          keys {
            value
            label
            isPartial
          }
          values
          previousValues
        }
      }
    `,
    resultRef
  )
  const {step, rows} = result
  if (rows.length === 0) {
    return <p className='m-0 py-6 text-center text-fg-muted text-sm'>Nothing to show</p>
  }
  if (spec.showAs === 'NUMBER') {
    return <ReportNumberView spec={spec} rows={rows} isCompact={isCompact} />
  }
  if (spec.showAs === 'LINE') {
    return <ReportLineView spec={spec} step={step} rows={rows} isCompact={isCompact} />
  }
  if (spec.showAs === 'BARS') {
    return <ReportBarsView spec={spec} step={step} rows={rows} isCompact={isCompact} />
  }
  if (spec.showAs === 'HEATMAP') {
    return <ReportHeatmapView spec={spec} step={step} rows={rows} isCompact={isCompact} />
  }
  return isCompact ? (
    <ReportTableSummary spec={spec} step={step} rows={rows} />
  ) : (
    <ReportTableView spec={spec} step={step} rows={rows} />
  )
}

export default ReportView
