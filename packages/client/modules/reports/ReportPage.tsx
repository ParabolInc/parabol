import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ReportPageQuery} from '../../__generated__/ReportPageQuery.graphql'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportNotes from './ReportNotes'
import ReportPageHeader from './ReportPageHeader'
import ReportSpecEditor from './ReportSpecEditor'
import ReportView from './ReportView'
import type {ReportPagePeriod} from './reportPeriodParam'
import {describeReportSpec} from './reportSpecLabels'

interface Props {
  queryRef: PreloadedQuery<ReportPageQuery>
  orgId: string
  spec: ReportSpec
  title: string | null
  period: ReportPagePeriod
  reportQuestionId: string | null
  onPeriodChange: (period: ReportPagePeriod) => void
  onSpecChange: (spec: ReportSpec) => void
}

const query = graphql`
  query ReportPageQuery(
    $orgId: ID!
    $spec: ReportSpecInput!
    $timeZone: String!
    $pagePeriod: ReportPeriodInput!
  ) {
    viewer {
      organization(orgId: $orgId) {
        ...ReportPageHeader_organization
        ...ReportSpecEditor_organization
        report(spec: $spec, timeZone: $timeZone, pagePeriod: $pagePeriod) {
          step
          ...ReportView_result
          ...ReportNotes_result
          ...ReportExportButton_result
        }
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
  onSpecChange
}: Props) => {
  const {viewer} = usePreloadedQuery<ReportPageQuery>(query, queryRef)
  const {organization} = viewer
  const report = organization?.report
  const name = title ?? describeReportSpec(spec)
  useDocumentTitle(`${name} | Reports | Parabol`, 'Reports')
  return (
    <div className='mx-auto flex w-full max-w-[1360px] flex-col gap-4 px-4 pt-4 pb-10 sm:px-8'>
      <ReportPageHeader
        orgId={orgId}
        organizationRef={organization}
        resultRef={report}
        spec={spec}
        name={name}
        period={period}
        reportQuestionId={reportQuestionId}
        onPeriodChange={onPeriodChange}
      />
      <ReportSpecEditor
        organizationRef={organization}
        spec={spec}
        step={report?.step}
        onChange={onSpecChange}
      />
      <section className='rounded-md border border-hairline bg-surface-card shadow-xs'>
        <div className='p-5'>
          {report ? (
            <ReportView spec={spec} resultRef={report} />
          ) : (
            <p className='m-0 text-fg-secondary'>This report couldn’t run for this organization.</p>
          )}
        </div>
        {report && <ReportNotes orgId={orgId} resultRef={report} />}
      </section>
    </div>
  )
}

export default ReportPage
