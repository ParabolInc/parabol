import {useMemo} from 'react'
import {parseReportSpec} from '../../shared/reports/parseReportSpec'
import type {ReportSpec} from '../../shared/reports/reportCatalog'

// A loaded query keeps showing its results while a changed spec loads, so they're drawn with the spec they came from
const useResultSpec = (loadedSpec: unknown, spec: ReportSpec) =>
  useMemo(() => parseReportSpec(loadedSpec).spec ?? spec, [loadedSpec, spec])

export default useResultSpec
