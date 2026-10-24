import {useMemo} from 'react'
import {Link, useParams, useSearchParams} from 'react-router'
import {ArrowBack} from '~/ui/icons'
import ReportPageLoader from './ReportPageLoader'
import {toReportsHomePath} from './reportPaths'
import {parseReportPeriodParam} from './reportPeriodParam'
import {decodeReportSpec} from './reportSpecParam'

const ReportPageRoot = () => {
  const {orgId} = useParams()
  const [searchParams] = useSearchParams()
  const specParam = searchParams.get('spec')
  const spec = useMemo(() => decodeReportSpec(specParam), [specParam])
  const period = parseReportPeriodParam(searchParams.get('period'))
  if (spec) {
    return (
      <ReportPageLoader
        orgId={orgId!}
        spec={spec}
        title={searchParams.get('title')}
        period={period}
        reportQuestionId={searchParams.get('question')}
      />
    )
  }
  return (
    <div className='mx-auto flex w-full max-w-[1360px] flex-col gap-2 px-4 pt-4 sm:px-8'>
      <Link
        aria-label='Back to Reports'
        to={toReportsHomePath(orgId!, period)}
        className='inline-flex items-center gap-1 self-start font-semibold text-[13px] text-sky-600 hover:underline dark:text-accent'
      >
        <ArrowBack className='text-[16px]' />
        Reports
      </Link>
      <p className='m-0 text-fg-secondary'>
        This link doesn’t hold a report Parabol can show. It may have been cut short.
      </p>
    </div>
  )
}

export default ReportPageRoot
