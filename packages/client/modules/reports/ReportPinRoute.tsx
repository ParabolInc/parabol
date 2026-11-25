import {getRouteApi, useLocation} from '@tanstack/react-router'
import useQueryRefLease from '../../routing/useQueryRefLease'
import ReportPin from './ReportPin'
import {parseReportPeriodParam} from './reportPeriodParam'

const routeApi = getRouteApi(
  '/tipTapLayout/privateLayout/dashboardLayout/reports/$orgId/pins/$pinParam'
)

const ReportPinRoute = () => {
  const {orgId, pinParam} = routeApi.useParams()
  const {queryRef, reportQueryRef} = routeApi.useLoaderData()
  const period = useLocation({
    select: (location) =>
      parseReportPeriodParam(new URLSearchParams(location.searchStr).get('period'))
  })
  useQueryRefLease(queryRef)
  useQueryRefLease(reportQueryRef)
  return (
    <ReportPin
      queryRef={queryRef}
      reportQueryRef={reportQueryRef}
      orgId={orgId}
      pinParam={pinParam}
      period={period}
    />
  )
}

export default ReportPinRoute
