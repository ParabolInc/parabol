import {toReportPinParam} from './reportPaths'
import {parseReportSpecJSON} from './reportSpecParam'

interface PinnedReport {
  id: string
  spec: string
}

// The pin a link names, with the spec it holds, or null once it's unpinned or holds a spec Parabol can't run
const findReportPin = <TPin extends PinnedReport>(
  pinnedReports: readonly TPin[] | undefined,
  pinParam: string
) => {
  const pin = pinnedReports?.find(({id}) => toReportPinParam(id) === pinParam)
  const spec = pin ? parseReportSpecJSON(pin.spec) : null
  return pin && spec ? {pin, spec} : null
}

export default findReportPin
