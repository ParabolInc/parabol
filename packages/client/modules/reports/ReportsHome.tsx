import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Link} from 'react-router'
import {Groups} from '~/ui/icons'
import type {ReportsHomeQuery} from '../../__generated__/ReportsHomeQuery.graphql'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import PinnedReportGrid from './PinnedReportGrid'
import ReportAskBox from './ReportAskBox'
import ReportAskLoading from './ReportAskLoading'
import ReportDrawerLayout from './ReportDrawerLayout'
import ReportPeriodMenu from './ReportPeriodMenu'
import ReportsAnswerLoader from './ReportsAnswerLoader'
import ReportsHeadline from './ReportsHeadline'
import ReportsOrgPicker from './ReportsOrgPicker'
import ReportsStarterBanner from './ReportsStarterBanner'
import type {ReportAddress} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'
import SignedUsageReportButton from './SignedUsageReportButton'

interface Props {
  queryRef: PreloadedQuery<ReportsHomeQuery>
  orgId: string
  period: ReportPagePeriod
  // the report that answers the question last asked
  answer: ReportAddress | null
  onPeriodChange: (period: ReportPagePeriod) => void
}

const query = graphql`
  query ReportsHomeQuery($orgId: ID!, $timeZone: String!, $pagePeriod: ReportPeriodInput!) {
    viewer {
      ...ReportsOrgPicker_viewer
      organizations {
        id
      }
      organization(orgId: $orgId) {
        createdAt
        isBillingLeader
        canSignUsageReport
        ...ReportsStarterBanner_organization
        ...ReportsHeadline_organization
        ...ReportAskBox_organization
        ...PinnedReportGrid_organization
      }
    }
  }
`

const ReportsHome = ({queryRef, orgId, period, answer, onPeriodChange}: Props) => {
  const {viewer} = usePreloadedQuery<ReportsHomeQuery>(query, queryRef)
  const {organization, organizations} = viewer
  const isViewerOnOrg = organizations.some(({id}) => id === orgId)
  useDocumentTitle('Reports | Parabol', 'Reports')
  const [askingQuestion, setAskingQuestion] = useState<string | null>(null)
  return (
    <ReportDrawerLayout>
      <div className='mx-auto flex w-full max-w-[1360px] flex-col gap-5 px-4 pt-4 pb-14 sm:px-8'>
        <div className='flex min-h-9 flex-wrap items-center gap-x-3 gap-y-2'>
          <h1 className='m-0 font-semibold text-xl'>Reports</h1>
          <ReportsOrgPicker viewerRef={viewer} orgId={orgId} period={period} />
          <span className='flex-1' />
          {organization?.canSignUsageReport && <SignedUsageReportButton orgId={orgId} />}
          {organization && (
            <ReportPeriodMenu
              period={period}
              onChange={onPeriodChange}
              orgCreatedAt={organization.createdAt}
            />
          )}
          {organization?.isBillingLeader && (
            <Link
              to={`/me/organizations/${orgId}/teams`}
              className='inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-hairline-strong pr-3 pl-2.5 font-semibold text-fg-primary text-sm hover:bg-surface-hover'
            >
              <Groups className='text-[18px] text-fg-secondary' />
              Team structure
            </Link>
          )}
        </div>
        {organization ? (
          <>
            <ReportsStarterBanner organizationRef={organization} />
            <ReportsHeadline organizationRef={organization} />
            <ReportAskBox
              organizationRef={organization}
              period={period}
              onAskingChange={setAskingQuestion}
            />
            {askingQuestion ? (
              <ReportAskLoading question={askingQuestion} />
            ) : (
              answer && <ReportsAnswerLoader orgId={orgId} answer={answer} period={period} />
            )}
            <PinnedReportGrid organizationRef={organization} period={period} />
          </>
        ) : (
          <p className='m-0 text-fg-secondary'>
            {isViewerOnOrg
              ? 'These reports couldn’t load. Try again in a moment.'
              : 'You aren’t a member of this organization.'}
          </p>
        )}
      </div>
    </ReportDrawerLayout>
  )
}

export default ReportsHome
