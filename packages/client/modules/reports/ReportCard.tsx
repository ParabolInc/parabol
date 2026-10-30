import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import type {ReportCard_pin$key} from '../../__generated__/ReportCard_pin.graphql'
import isRetroCadenceSpec from './isRetroCadenceSpec'
import isTaskFlowSpec from './isTaskFlowSpec'
import ReportCardMenu from './ReportCardMenu'
import ReportRetroCadenceEmpty from './ReportRetroCadenceEmpty'
import ReportTaskFlowEmpty from './ReportTaskFlowEmpty'
import ReportTeamHealthEmpty from './ReportTeamHealthEmpty'
import ReportView from './ReportView'
import {toReportPinPath} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'
import {REPORT_PERIOD_LABELS} from './reportSpecLabels'
import {parseReportSpecJSON} from './reportSpecParam'

interface Props {
  pinRef: ReportCard_pin$key
  orgId: string
  period: ReportPagePeriod
  index: number
  pinCount: number
  isLeader: boolean
}

const ReportCard = ({pinRef, orgId, period, index, pinCount, isLeader}: Props) => {
  const pin = useFragment(
    graphql`
      fragment ReportCard_pin on PinnedReport {
        id
        title
        pinnedBy {
          preferredName
        }
        description
        spec
        report(timeZone: $timeZone, pagePeriod: $pagePeriod) {
          ...ReportView_result
          teamHealth {
            latestCheckEndedAt
          }
          latestRetroAt: latestMeetingAt(meetingType: retrospective)
          latestTaskAt
        }
      }
    `,
    pinRef
  )
  const {id: pinId, title, description, pinnedBy, report} = pin
  const spec = useMemo(() => parseReportSpecJSON(pin.spec), [pin.spec])
  const ownPeriod = spec?.period?.preset ?? null
  return (
    <article className='flex min-w-0 flex-col gap-3 rounded-md border border-hairline bg-surface-card py-4 pr-3 pl-5 shadow-xs'>
      <div className='flex items-start gap-2'>
        <div className='flex min-w-0 flex-1 flex-col'>
          <h3 className='m-0 font-semibold text-base'>{title}</h3>
          <span className='text-fg-muted text-xs'>
            {pinnedBy ? `Pinned by ${pinnedBy.preferredName}` : `Built in · ${description}`}
            {ownPeriod && ` · Fixed to ${REPORT_PERIOD_LABELS[ownPeriod].toLowerCase()}`}
          </span>
        </div>
        {isLeader && (
          <ReportCardMenu
            orgId={orgId}
            pinId={pinId}
            title={title}
            index={index}
            pinCount={pinCount}
          />
        )}
      </div>
      <div className='pr-2'>
        {spec && report.teamHealth && !report.teamHealth.latestCheckEndedAt ? (
          <ReportTeamHealthEmpty orgId={orgId} isCompact />
        ) : spec && !report.latestRetroAt && isRetroCadenceSpec(spec) ? (
          <ReportRetroCadenceEmpty isCompact />
        ) : spec && !report.latestTaskAt && isTaskFlowSpec(spec) ? (
          <ReportTaskFlowEmpty isCompact />
        ) : spec ? (
          <ReportView spec={spec} resultRef={report} isCompact />
        ) : (
          <p className='m-0 text-fg-muted text-sm'>This report can’t be shown</p>
        )}
      </div>
      {spec && (
        <Link
          to={toReportPinPath(orgId, pinId, period)}
          className='mt-auto self-start font-semibold text-[13px] text-sky-600 hover:underline dark:text-accent'
        >
          Open report
        </Link>
      )}
    </article>
  )
}

export default ReportCard
