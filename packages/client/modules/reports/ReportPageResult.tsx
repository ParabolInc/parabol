import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {ReportPageResult_organization$key} from '../../__generated__/ReportPageResult_organization.graphql'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import isLoneActiveUserReport from './isLoneActiveUserReport'
import isMeetingsByTypeSpec from './isMeetingsByTypeSpec'
import isRetroCadenceSpec from './isRetroCadenceSpec'
import isTaskFlowSpec from './isTaskFlowSpec'
import ReportActiveUsersEmpty from './ReportActiveUsersEmpty'
import ReportMeetingsByTypeEmpty from './ReportMeetingsByTypeEmpty'
import ReportNotes from './ReportNotes'
import ReportRetroCadenceEmpty from './ReportRetroCadenceEmpty'
import ReportTaskFlowEmpty from './ReportTaskFlowEmpty'
import ReportTeamHealthEmpty from './ReportTeamHealthEmpty'
import ReportView from './ReportView'

interface Props {
  organizationRef: ReportPageResult_organization$key | null | undefined
  orgId: string
  spec: ReportSpec
}

const ReportPageResult = ({organizationRef, orgId, spec}: Props) => {
  const organization = useFragment(
    graphql`
      fragment ReportPageResult_organization on Organization {
        report(spec: $spec, timeZone: $timeZone) {
          ...ReportView_result
          ...ReportNotes_result
          teamHealth {
            latestCheckEndedAt
            ...ReportTeamHealthView_teamHealth
          }
          rows {
            values
          }
          latestMeetingAt
          latestRetroAt: latestMeetingAt(meetingType: retrospective)
          latestTaskAt
        }
        allTeams: report(spec: $allTeamsSpec, timeZone: $timeZone) @include(if: $hasAllTeams) {
          rows {
            keys {
              value
            }
            values
          }
        }
        allTeamsTotal: report(spec: $allTeamsTotalSpec, timeZone: $timeZone)
          @include(if: $hasAllTeams) {
          rows {
            keys {
              value
            }
            values
          }
        }
        lastHeld: report(spec: $lastHeldSpec, timeZone: $timeZone)
          @include(if: $hasLastHeld) {
          rows {
            keys {
              value
            }
            values
          }
        }
      }
    `,
    organizationRef
  )
  const report = organization?.report
  const lastHeldRows = organization?.lastHeld?.rows
  const allTeams = organization?.allTeams
  const allTeamsTotal = organization?.allTeamsTotal
  const allTeamsRows = useMemo(
    () =>
      allTeams && allTeamsTotal
        ? {allTeams: allTeams.rows, allTeamsTotal: allTeamsTotal.rows[0] ?? null}
        : null,
    [allTeams, allTeamsTotal]
  )
  const lastHeldByTeamId = useMemo(
    () =>
      lastHeldRows &&
      new Map(lastHeldRows.map(({keys, values}) => [keys[0]?.value ?? '', values[0] ?? null])),
    [lastHeldRows]
  )
  return (
    <>
      <div className='border-hairline border-t p-5'>
        {report?.teamHealth && !report.teamHealth.latestCheckEndedAt ? (
          <ReportTeamHealthEmpty orgId={orgId} />
        ) : report && !report.latestRetroAt && isRetroCadenceSpec(spec) ? (
          <ReportRetroCadenceEmpty />
        ) : report && !report.latestTaskAt && isTaskFlowSpec(spec) ? (
          <ReportTaskFlowEmpty />
        ) : report && !report.latestMeetingAt && isMeetingsByTypeSpec(spec) ? (
          <ReportMeetingsByTypeEmpty />
        ) : report && isLoneActiveUserReport(spec, report.rows) ? (
          <ReportActiveUsersEmpty orgId={orgId} />
        ) : report ? (
          <ReportView
            spec={spec}
            resultRef={report}
            lastHeldByTeamId={lastHeldByTeamId}
            orgId={orgId}
            teamHealthRef={report.teamHealth}
            allTeamsRows={allTeamsRows}
          />
        ) : (
          <p className='m-0 text-fg-secondary'>This report couldn’t run for this organization.</p>
        )}
      </div>
      {report && (
        <ReportNotes
          orgId={orgId}
          resultRef={report}
          hasHiddenTeamRows={
            !!report.teamHealth && spec.breakdown.some(({dimension}) => dimension === 'TEAM')
          }
        />
      )}
    </>
  )
}

export default ReportPageResult
