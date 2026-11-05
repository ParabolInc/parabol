import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ReportPageQuery} from '../../__generated__/ReportPageQuery.graphql'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportDrawerLayout from './ReportDrawerLayout'
import ReportPageHeader from './ReportPageHeader'
import ReportPanel from './ReportPanel'
import type {ReportPagePeriod} from './reportPeriodParam'
import {describeReportSpec} from './reportSpecLabels'
import useResultSpec from './useResultSpec'

interface Props {
  queryRef: PreloadedQuery<ReportPageQuery>
  orgId: string
  spec: ReportSpec
  title: string | null
  period: ReportPagePeriod
  reportQuestionId: string | null
  onPeriodChange: (period: ReportPagePeriod) => void
  onSpecChange: (spec: ReportSpec, title: string) => void
  onRetry: (() => void) | null
}

const query = graphql`
  query ReportPageQuery(
    $orgId: ID!
    $spec: ReportSpecInput!
    $timeZone: String!
    $lastHeldSpec: ReportSpecInput!
    $hasLastHeld: Boolean!
    $allTeamsSpec: ReportSpecInput!
    $allTeamsTotalSpec: ReportSpecInput!
    $hasAllTeams: Boolean!
  ) {
    viewer {
      organization(orgId: $orgId) {
        structure {
          id
          name
        }
        ...ReportPageHeader_organization
        ...ReportPanel_organization
      }
    }
  }
`

const ReportPage = ({
  queryRef,
  orgId,
  spec,
  title,
  period,
  reportQuestionId,
  onPeriodChange,
  onSpecChange,
  onRetry
}: Props) => {
  const {viewer} = usePreloadedQuery<ReportPageQuery>(query, queryRef)
  const {resultSpec, isUpdating} = useResultSpec(queryRef.variables.spec, spec, period)
  const {organization} = viewer
  const levels = organization?.structure ?? []
  const name = title ?? describeReportSpec(spec, levels)
  useDocumentTitle(`${name} | Reports | Parabol`, 'Reports')
  return (
    <ReportDrawerLayout>
      <div className='mx-auto flex w-full max-w-[1360px] flex-col gap-3 px-4 pt-4 pb-10 sm:px-8'>
        <ReportPageHeader
          orgId={orgId}
          organizationRef={organization}
          spec={spec}
          period={period}
          onPeriodChange={onPeriodChange}
        />
        <ReportPanel
          organizationRef={organization}
          orgId={orgId}
          spec={spec}
          resultSpec={resultSpec}
          isUpdating={isUpdating}
          onRetry={onRetry}
          name={name}
          period={period}
          reportQuestionId={reportQuestionId}
          isPageHeading
          onSpecChange={(nextSpec) => onSpecChange(nextSpec, describeReportSpec(nextSpec, levels))}
        />
      </div>
    </ReportDrawerLayout>
  )
}

export default ReportPage
