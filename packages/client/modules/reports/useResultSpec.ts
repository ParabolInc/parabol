import areEqual from 'fbjs/lib/areEqual'
import {useMemo} from 'react'
import {parseReportSpec} from '../../shared/reports/parseReportSpec'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import type {ReportPagePeriod} from './reportPeriodParam'
import withPagePeriod from './withPagePeriod'

// A loaded query keeps showing its results while a changed spec loads, so they're drawn with the spec they came from,
// and say they're out of date until the new results arrive
const useResultSpec = (loadedSpec: unknown, spec: ReportSpec, period: ReportPagePeriod) =>
  useMemo(
    () => ({
      resultSpec: parseReportSpec(loadedSpec).spec ?? spec,
      isUpdating: !areEqual(loadedSpec, withPagePeriod(spec, period))
    }),
    [loadedSpec, spec, period]
  )

export default useResultSpec
