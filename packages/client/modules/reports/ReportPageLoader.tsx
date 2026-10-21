import {Suspense, useMemo} from 'react'
import {useNavigate} from 'react-router'
import reportPageQuery, {type ReportPageQuery} from '../../__generated__/ReportPageQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import useStartReportQuestionMutation from '../../mutations/useStartReportQuestionMutation'
import {isReportTimeDimension, type ReportSpec} from '../../shared/reports/reportCatalog'
import {validateReportSpec} from '../../shared/reports/validateReportSpec'
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

// A heatmap of meetings by team over time also says when each team last met, with the same filters
const toLastHeldSpec = (spec: ReportSpec): ReportSpec | null => {
  const [rows, columns] = spec.breakdown
  if (spec.showAs !== 'HEATMAP' || spec.measures[0] !== 'MEETINGS' || spec.breakdown.length !== 2) {
    return null
  }
  if (rows?.dimension !== 'TEAM' || !columns || !isReportTimeDimension(columns.dimension))
    return null
  const lastHeldSpec: ReportSpec = {
    ...spec,
    measures: ['LAST_MEETING'],
    breakdown: [{dimension: 'TEAM'}],
    where: [],
    compareTo: null,
    showAs: 'TABLE',
    sort: null,
    limit: null
  }
  return validateReportSpec(lastHeldSpec) === null ? lastHeldSpec : null
}

const ReportPageLoader = ({orgId, spec, title, period, reportQuestionId}: Props) => {
  const navigate = useNavigate()
  const [start] = useStartReportQuestionMutation()
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])
  const lastHeldSpec = useMemo(() => toLastHeldSpec(spec), [spec])
  const queryRef = useQueryLoaderNow<ReportPageQuery>(
    reportPageQuery,
    {
      orgId,
      spec,
      timeZone,
      pagePeriod: period,
      lastHeldSpec: lastHeldSpec ?? spec,
      hasLastHeld: !!lastHeldSpec
    },
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
