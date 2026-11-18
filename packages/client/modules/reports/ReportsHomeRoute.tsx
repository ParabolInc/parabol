import {getRouteApi, useLocation, useNavigate} from '@tanstack/react-router'
import {useMemo} from 'react'
import useQueryRefLease from '../../routing/useQueryRefLease'
import ReportsHome from './ReportsHome'
import {readReportAddress, toReportsHomePath} from './reportPaths'
import {parseReportPeriodParam, type ReportPagePeriod} from './reportPeriodParam'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/dashboardLayout/reports/$orgId')

const ReportsHomeRoute = () => {
  const {orgId} = routeApi.useParams()
  const {queryRef} = routeApi.useLoaderData()
  const searchStr = useLocation({select: (location) => location.searchStr})
  const searchParams = useMemo(() => new URLSearchParams(searchStr), [searchStr])
  const navigate = useNavigate()
  const period = parseReportPeriodParam(searchParams.get('period'))
  const answer = useMemo(() => readReportAddress(searchParams), [searchParams])
  useQueryRefLease(queryRef)
  const onPeriodChange = (nextPeriod: ReportPagePeriod) => {
    navigate({href: toReportsHomePath(orgId, nextPeriod, answer), replace: true})
  }
  return (
    <ReportsHome
      queryRef={queryRef}
      orgId={orgId}
      period={period}
      answer={answer}
      onPeriodChange={onPeriodChange}
    />
  )
}

export default ReportsHomeRoute
