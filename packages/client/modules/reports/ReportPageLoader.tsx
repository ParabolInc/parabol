import {Suspense, useMemo} from 'react'
import {useNavigate} from 'react-router'
import reportPageQuery, {type ReportPageQuery} from '../../__generated__/ReportPageQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import useStartReportQuestionMutation from '../../mutations/useStartReportQuestionMutation'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportPage from './ReportPage'
import {toReportPagePath} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'
import {describeReportSpec} from './reportSpecLabels'

interface Props {
  orgId: string
  spec: ReportSpec
  title: string | null
  period: ReportPagePeriod
  reportQuestionId: string | null
}

const ReportPageLoader = ({orgId, spec, title, period, reportQuestionId}: Props) => {
  const navigate = useNavigate()
  const [start] = useStartReportQuestionMutation()
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])
  const queryRef = useQueryLoaderNow<ReportPageQuery>(
    reportPageQuery,
    {orgId, spec, timeZone, pagePeriod: period},
    undefined,
    true
  )
  const onPeriodChange = (nextPeriod: ReportPagePeriod) => {
    navigate(toReportPagePath(orgId, spec, title, nextPeriod, reportQuestionId), {replace: true})
  }
  const onSpecChange = (nextSpec: ReportSpec) => {
    const nextPath = toReportPagePath(orgId, nextSpec, null, period, reportQuestionId)
    navigate(nextPath, {replace: true})
    start({
      variables: reportQuestionId
        ? {orgId, reportQuestionId, spec: nextSpec}
        : {orgId, spec: nextSpec, title: describeReportSpec(nextSpec)},
      onCompleted: (response) => {
        const builtId = response.startReportQuestion?.reportQuestion.id
        // a reply that lands after another edit, or after leaving the page, must not navigate
        const isStillShown = `${window.location.pathname}${window.location.search}` === nextPath
        if (!reportQuestionId && builtId && isStillShown) {
          navigate(toReportPagePath(orgId, nextSpec, null, period, builtId), {replace: true})
        }
      }
    })
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
          reportQuestionId={reportQuestionId}
          onPeriodChange={onPeriodChange}
          onSpecChange={onSpecChange}
        />
      )}
    </Suspense>
  )
}

export default ReportPageLoader
