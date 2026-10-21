import {Suspense, useMemo} from 'react'
import {useNavigate, useParams, useSearchParams} from 'react-router'
import reportsHomeQuery, {type ReportsHomeQuery} from '../../__generated__/ReportsHomeQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import ReportsHome from './ReportsHome'
import {toReportsHomePath} from './reportPaths'
import {parseReportPeriodParam, type ReportPagePeriod} from './reportPeriodParam'

const ReportsHomeRoot = () => {
  const {orgId} = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const period = parseReportPeriodParam(searchParams.get('period'))
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])
  // keep the last period's numbers up while the next period loads
  const queryRef = useQueryLoaderNow<ReportsHomeQuery>(
    reportsHomeQuery,
    {orgId: orgId!, timeZone, pagePeriod: period},
    undefined,
    true
  )
  const onPeriodChange = (nextPeriod: ReportPagePeriod) => {
    navigate(toReportsHomePath(orgId!, nextPeriod), {replace: true})
  }
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <ReportsHome
          queryRef={queryRef}
          orgId={orgId!}
          period={period}
          onPeriodChange={onPeriodChange}
        />
      )}
    </Suspense>
  )
}

export default ReportsHomeRoot
