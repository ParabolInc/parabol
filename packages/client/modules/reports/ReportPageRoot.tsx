import {useLocation, useParams} from '@tanstack/react-router'
import {useMemo} from 'react'
import ReportLinkMissing from './ReportLinkMissing'
import ReportPageLoader from './ReportPageLoader'
import {parseReportPeriodParam} from './reportPeriodParam'
import {readReportSpecParams} from './reportSpecParam'

const ReportPageRoot = () => {
  const {orgId} = useParams({strict: false})
  const searchStr = useLocation({select: (location) => location.searchStr})
  const searchParams = useMemo(() => new URLSearchParams(searchStr), [searchStr])
  const spec = useMemo(() => readReportSpecParams(searchParams), [searchParams])
  const period = parseReportPeriodParam(searchParams.get('period'))
  if (!spec) {
    return (
      <ReportLinkMissing orgId={orgId!} period={period} message='This link doesn’t open a report' />
    )
  }
  return (
    <ReportPageLoader
      orgId={orgId!}
      spec={spec}
      title={null}
      pinId={null}
      period={period}
      reportQuestionId={searchParams.get('question')}
    />
  )
}

export default ReportPageRoot
