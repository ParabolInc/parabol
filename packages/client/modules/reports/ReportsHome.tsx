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
import ReportPeriodMenu from './ReportPeriodMenu'
import ReportsAnswerLoader from './ReportsAnswerLoader'
import ReportsHeadline from './ReportsHeadline'
import ReportsOrgPicker from './ReportsOrgPicker'
import ReportsStarterBanner from './ReportsStarterBanner'
import type {ReportAddress} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'

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
        hasReports: featureFlag(featureName: "Reports")
      }
      organization(orgId: $orgId) {
        createdAt
        isBillingLeader
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
  useDocumentTitle('Reports | Parabol', 'Reports')
  const hasReports = organizations.some(({id, hasReports}) => id === orgId && hasReports)
  const [askingQuestion, setAskingQuestion] = useState<string | null>(null)
  return (
    <div className='mx-auto flex w-full max-w-[1360px] flex-col gap-5 px-4 pt-4 pb-14 sm:px-8'>
      <div className='flex min-h-9 flex-wrap items-center gap-x-3 gap-y-2'>
        <h1 className='m-0 font-semibold text-xl'>Reports</h1>
        <ReportsOrgPicker viewerRef={viewer} orgId={orgId} period={period} />
        <span className='flex-1' />
        {organization && (
          <ReportPeriodMenu
            period={period}
            onChange={onPeriodChange}
            orgCreatedAt={organization.createdAt}
          />
        )}
        {hasReports && organization?.isBillingLeader && (
          <Link
            to={`/me/organizations/${orgId}/teams`}
            className='inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-hairline-strong pr-3 pl-2.5 font-semibold text-fg-primary text-sm hover:bg-surface-hover'
          >
            <Groups className='text-[18px] text-fg-secondary' />
            Team structure
          </Link>
        )}
      </div>
      {!hasReports && (
        <p className='m-0 text-fg-secondary'>Reports aren’t turned on for this organization.</p>
      )}
      {hasReports && !organization && (
        <p className='m-0 text-fg-secondary'>These reports couldn’t load. Try again in a moment.</p>
      )}
      {hasReports && organization && (
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
      )}
    </div>
  )
}

export default ReportsHome
