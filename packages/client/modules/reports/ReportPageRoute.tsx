import {getRouteApi, useLocation, useNavigate} from '@tanstack/react-router'
import {useMemo} from 'react'
import useQueryRefLease from '../../routing/useQueryRefLease'
import ReportLinkMissing from './ReportLinkMissing'
import ReportPage from './ReportPage'
import ReportPageLoadError from './ReportPageLoadError'
import {toReportPagePath} from './reportPaths'
import {parseReportPeriodParam, type ReportPagePeriod} from './reportPeriodParam'
import {readReportSpecParams} from './reportSpecParam'
import useReportSpecChange from './useReportSpecChange'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/dashboardLayout/reports/$orgId/report')

// The spec comes from the address, which changes before the next results load, so the old results show as out of date
const ReportPageRoute = () => {
  const {orgId} = routeApi.useParams()
  const {queryRef} = routeApi.useLoaderData()
  const navigate = useNavigate()
  const searchStr = useLocation({select: (location) => location.searchStr})
  const searchParams = useMemo(() => new URLSearchParams(searchStr), [searchStr])
  const spec = useMemo(() => readReportSpecParams(searchParams), [searchParams])
  const period = parseReportPeriodParam(searchParams.get('period'))
  const reportQuestionId = searchParams.get('question')
  useQueryRefLease(queryRef)
  const onSpecChange = useReportSpecChange(orgId, reportQuestionId, (nextSpec, questionId) =>
    toReportPagePath(orgId, nextSpec, period, questionId)
  )
  if (!spec) {
    return (
      <ReportLinkMissing orgId={orgId} period={period} message='This link doesn’t open a report' />
    )
  }
  if (!queryRef) return <ReportPageLoadError />
  const onPeriodChange = (nextPeriod: ReportPagePeriod) => {
    navigate({href: toReportPagePath(orgId, spec, nextPeriod, reportQuestionId), replace: true})
  }
  return (
    <ReportPage
      queryRef={queryRef}
      orgId={orgId}
      spec={spec}
      title={null}
      period={period}
      reportQuestionId={reportQuestionId}
      onPeriodChange={onPeriodChange}
      onSpecChange={onSpecChange}
    />
  )
}

export default ReportPageRoute
