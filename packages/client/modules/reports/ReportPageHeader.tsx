import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import {ArrowBack} from '~/ui/icons'
import type {ReportExportButton_result$key} from '../../__generated__/ReportExportButton_result.graphql'
import type {ReportPageHeader_organization$key} from '../../__generated__/ReportPageHeader_organization.graphql'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportExportButton from './ReportExportButton'
import ReportPeriodMenu from './ReportPeriodMenu'
import ReportPinButton from './ReportPinButton'
import {toReportsHomePath} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'

interface Props {
  orgId: string
  organizationRef: ReportPageHeader_organization$key | null | undefined
  resultRef: ReportExportButton_result$key | null | undefined
  spec: ReportSpec
  name: string
  period: ReportPagePeriod
  reportQuestionId: string | null
  onPeriodChange: (period: ReportPagePeriod) => void
}

const ReportPageHeader = ({
  orgId,
  organizationRef,
  resultRef,
  spec,
  name,
  period,
  reportQuestionId,
  onPeriodChange
}: Props) => {
  const organization = useFragment(
    graphql`
      fragment ReportPageHeader_organization on Organization {
        createdAt
        ...ReportPinButton_organization
      }
    `,
    organizationRef
  )
  return (
    <div className='flex flex-col gap-1'>
      <Link
        aria-label='Back to Reports'
        to={toReportsHomePath(orgId, period)}
        className='inline-flex items-center gap-1 self-start font-semibold text-[13px] text-sky-600 hover:underline dark:text-accent'
      >
        <ArrowBack className='text-[16px]' />
        Reports
      </Link>
      <div className='flex min-h-9 flex-wrap items-center gap-x-3 gap-y-2'>
        <h1 className='m-0 font-semibold text-xl'>{name}</h1>
        <span className='flex-1' />
        {organization && (
          <ReportPinButton
            organizationRef={organization}
            spec={spec}
            title={name}
            reportQuestionId={reportQuestionId}
          />
        )}
        {organization && spec.period.preset === 'PAGE' && (
          <ReportPeriodMenu
            period={period}
            onChange={onPeriodChange}
            orgCreatedAt={organization.createdAt}
          />
        )}
        {resultRef && <ReportExportButton resultRef={resultRef} spec={spec} title={name} />}
      </div>
    </div>
  )
}

export default ReportPageHeader
