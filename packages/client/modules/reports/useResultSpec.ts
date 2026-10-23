import {useMemo} from 'react'
import {readReportSpec} from '../../shared/reports/parseReportSpec'
import type {ReportSpec} from '../../shared/reports/reportCatalog'

// A loaded query keeps showing its results while a changed spec loads, so they're drawn with the spec they came from
const useResultSpec = (loadedSpec: unknown, spec: ReportSpec) =>
  useMemo(() => readReportSpec(loadedSpec) ?? spec, [loadedSpec, spec])

export default useResultSpec
