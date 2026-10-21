import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ReportsHomeQuery} from '../../__generated__/ReportsHomeQuery.graphql'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import ReportAskBox from './ReportAskBox'
import ReportPeriodMenu from './ReportPeriodMenu'
import ReportPinGrid from './ReportPinGrid'
import ReportsHeadline from './ReportsHeadline'
import ReportsOrgPicker from './ReportsOrgPicker'
import ReportsStarterBanner from './ReportsStarterBanner'
import type {ReportPagePeriod} from './reportPeriodParam'

interface Props {
  queryRef: PreloadedQuery<ReportsHomeQuery>
  orgId: string
  period: ReportPagePeriod
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
        ...ReportsStarterBanner_organization
        ...ReportsHeadline_organization
        ...ReportAskBox_organization
        ...ReportPinGrid_organization
      }
    }
  }
`

const ReportsHome = ({queryRef, orgId, period, onPeriodChange}: Props) => {
  const {viewer} = usePreloadedQuery<ReportsHomeQuery>(query, queryRef)
  const {organization, organizations} = viewer
  useDocumentTitle('Reports | Parabol', 'Reports')
  const hasReports = organizations.some(({id, hasReports}) => id === orgId && hasReports)
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
          <ReportAskBox organizationRef={organization} period={period} />
          <ReportPinGrid organizationRef={organization} period={period} />
        </>
      )}
    </div>
  )
}

export default ReportsHome
