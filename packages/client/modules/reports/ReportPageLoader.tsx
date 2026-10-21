import {Suspense, useMemo} from 'react'
import {useNavigate} from 'react-router'
import reportPageQuery, {type ReportPageQuery} from '../../__generated__/ReportPageQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportPage from './ReportPage'
import {toReportPagePath} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'

interface Props {
  orgId: string
  spec: ReportSpec
  title: string | null
  period: ReportPagePeriod
}

const ReportPageLoader = ({orgId, spec, title, period}: Props) => {
  const navigate = useNavigate()
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])
  const queryRef = useQueryLoaderNow<ReportPageQuery>(
    reportPageQuery,
    {orgId, spec, timeZone, pagePeriod: period},
    undefined,
    true
  )
  const onPeriodChange = (nextPeriod: ReportPagePeriod) => {
    navigate(toReportPagePath(orgId, spec, title, nextPeriod), {replace: true})
  }
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <ReportPage
          queryRef={queryRef}
          orgId={orgId}
          spec={spec}
          title={title}
          period={period}
          onPeriodChange={onPeriodChange}
        />
      )}
    </Suspense>
  )
}

export default ReportPageLoader
