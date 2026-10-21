import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Link} from 'react-router'
import {ArrowBack} from '~/ui/icons'
import type {ReportPageQuery} from '../../__generated__/ReportPageQuery.graphql'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportNotes from './ReportNotes'
import ReportPeriodMenu from './ReportPeriodMenu'
import ReportSpecChips from './ReportSpecChips'
import ReportView from './ReportView'
import {toReportsHomePath} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'
import {describeReportSpec} from './reportSpecLabels'

interface Props {
  queryRef: PreloadedQuery<ReportPageQuery>
  orgId: string
  spec: ReportSpec
  title: string | null
  period: ReportPagePeriod
  onPeriodChange: (period: ReportPagePeriod) => void
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
        createdAt
        report(spec: $spec, timeZone: $timeZone, pagePeriod: $pagePeriod) {
          step
          rows {
            keys {
              value
              label
            }
          }
          ...ReportView_result
          ...ReportNotes_result
        }
      }
    }
  }
`

const ReportPage = ({queryRef, orgId, spec, title, period, onPeriodChange}: Props) => {
  const {viewer} = usePreloadedQuery<ReportPageQuery>(query, queryRef)
  const {organization} = viewer
  const report = organization?.report
  const name = title ?? describeReportSpec(spec)
  useDocumentTitle(`${name} | Reports | Parabol`, 'Reports')
  const teamPosition = spec.breakdown.findIndex(({dimension}) => dimension === 'TEAM')
  const teamNames = new Map(
    (report?.rows ?? []).flatMap(({keys}) => {
      const key = keys[teamPosition]
      return key ? [[key.value, key.label] as const] : []
    })
  )
  return (
    <div className='mx-auto flex w-full max-w-[1360px] flex-col gap-4 px-4 pt-4 pb-10 sm:px-8'>
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
          {organization && spec.period.preset === 'PAGE' && (
            <ReportPeriodMenu
              period={period}
              onChange={onPeriodChange}
              orgCreatedAt={organization.createdAt}
            />
          )}
        </div>
      </div>
      <ReportSpecChips spec={spec} step={report?.step} teamNames={teamNames} />
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
