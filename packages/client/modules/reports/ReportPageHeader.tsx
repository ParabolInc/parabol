import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import {ArrowBack} from '~/ui/icons'
import type {ReportPageHeader_organization$key} from '../../__generated__/ReportPageHeader_organization.graphql'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportPeriodMenu from './ReportPeriodMenu'
import {toReportsHomePath} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'

interface Props {
  orgId: string
  organizationRef: ReportPageHeader_organization$key | null | undefined
  spec: ReportSpec
  period: ReportPagePeriod
  onPeriodChange: (period: ReportPagePeriod) => void
}

const ReportPageHeader = ({orgId, organizationRef, spec, period, onPeriodChange}: Props) => {
  const organization = useFragment(
    graphql`
      fragment ReportPageHeader_organization on Organization {
        createdAt
      }
    `,
    organizationRef
  )
  return (
    <div className='flex min-h-9 flex-wrap items-center gap-x-3 gap-y-2'>
      <Link
        aria-label='Back to Reports'
        to={toReportsHomePath(orgId, period)}
        className='inline-flex items-center gap-1 font-semibold text-[13px] text-sky-600 hover:underline dark:text-accent'
      >
        <ArrowBack className='text-[16px]' />
        Reports
      </Link>
      <span className='flex-1' />
      {organization && !spec.period && (
        <ReportPeriodMenu
          period={period}
          onChange={onPeriodChange}
          orgCreatedAt={organization.createdAt}
        />
      )}
    </div>
  )
}

export default ReportPageHeader
