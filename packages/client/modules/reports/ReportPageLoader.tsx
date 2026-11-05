import {Suspense, useMemo} from 'react'
import {useNavigate} from 'react-router'
import reportPageQuery, {type ReportPageQuery} from '../../__generated__/ReportPageQuery.graphql'
import {useQueryLoaderNowWithRetry} from '../../hooks/useQueryLoaderNow'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportLoadError from './ReportLoadError'
import ReportPage from './ReportPage'
import {toReportPagePath, toReportPinPath} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'
import toReportPanelVariables from './toReportPanelVariables'
import useReportSpecChange from './useReportSpecChange'

interface Props {
  orgId: string
  spec: ReportSpec
  // the pin's own title, which an edit leaves behind with the pin
  title: string | null
  pinId: string | null
  period: ReportPagePeriod
  reportQuestionId: string | null
}

const ReportPageLoader = ({orgId, spec, title, pinId, period, reportQuestionId}: Props) => {
  const navigate = useNavigate()
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])
  const panelVariables = useMemo(() => toReportPanelVariables(spec, period), [spec, period])
  const {queryRef, retry, error} = useQueryLoaderNowWithRetry<ReportPageQuery>(
    reportPageQuery,
    {orgId, timeZone, ...panelVariables},
    {preventSuspense: true}
  )
  const onPeriodChange = (nextPeriod: ReportPagePeriod) => {
    navigate(
      pinId
        ? toReportPinPath(orgId, pinId, nextPeriod)
        : toReportPagePath(orgId, spec, nextPeriod, reportQuestionId),
      {replace: true}
    )
  }
  const onSpecChange = useReportSpecChange(orgId, reportQuestionId, (nextSpec, questionId) =>
    toReportPagePath(orgId, nextSpec, period, questionId)
  )
  if (!queryRef && error) {
    return (
      <div className='px-4 pt-4 sm:px-8'>
        <ReportLoadError onRetry={retry} />
      </div>
    )
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
          onRetry={error ? retry : null}
        />
      )}
    </Suspense>
  )
}

export default ReportPageLoader
