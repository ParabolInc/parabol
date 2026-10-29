import {Suspense, useMemo} from 'react'
import {useNavigate} from 'react-router'
import reportsAnswerQuery, {
  type ReportsAnswerQuery
} from '../../__generated__/ReportsAnswerQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import ReportsAnswer from './ReportsAnswer'
import {type ReportAddress, toReportsHomePath} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'
import toReportPanelVariables from './toReportPanelVariables'
import useReportSpecChange from './useReportSpecChange'

interface Props {
  orgId: string
  answer: ReportAddress
  period: ReportPagePeriod
}

// The report that answers a question, between the Ask box and the pins. It stays in the address, so
// reloading or going back keeps it
const ReportsAnswerLoader = ({orgId, answer, period}: Props) => {
  const {spec, reportQuestionId} = answer
  const navigate = useNavigate()
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])
  const panelVariables = useMemo(() => toReportPanelVariables(spec, period), [spec, period])
  const queryRef = useQueryLoaderNow<ReportsAnswerQuery>(
    reportsAnswerQuery,
    {orgId, timeZone, ...panelVariables},
    undefined,
    true
  )
  const onSpecChange = useReportSpecChange(orgId, reportQuestionId, (nextSpec, questionId) =>
    toReportsHomePath(orgId, period, {spec: nextSpec, reportQuestionId: questionId})
  )
  const onClose = () => navigate(toReportsHomePath(orgId, period))
  if (!queryRef) {
    return (
      <section className='rounded-md border border-hairline bg-surface-card px-5 py-4 shadow-xs'>
        <p className='m-0 text-fg-secondary text-sm'>Running the report…</p>
      </section>
    )
  }
  return (
    <Suspense fallback={''}>
      <ReportsAnswer
        queryRef={queryRef}
        orgId={orgId}
        answer={answer}
        period={period}
        onSpecChange={onSpecChange}
        onClose={onClose}
      />
    </Suspense>
  )
}

export default ReportsAnswerLoader
