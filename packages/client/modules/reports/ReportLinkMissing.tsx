import {Link} from 'react-router'
import {ArrowBack} from '~/ui/icons'
import {toReportsHomePath} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'

interface Props {
  orgId: string
  period: ReportPagePeriod
  message: string
}

const ReportLinkMissing = ({orgId, period, message}: Props) => {
  return (
    <div className='mx-auto flex w-full max-w-[1360px] flex-col gap-2 px-4 pt-4 sm:px-8'>
      <Link
        aria-label='Back to Reports'
        to={toReportsHomePath(orgId, period)}
        className='inline-flex items-center gap-1 self-start font-semibold text-[13px] text-sky-600 hover:underline dark:text-accent'
      >
        <ArrowBack className='text-[16px]' />
        Reports
      </Link>
      <p className='m-0 text-fg-secondary'>{message}</p>
    </div>
  )
}

export default ReportLinkMissing
