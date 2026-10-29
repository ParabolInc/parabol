import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {ReportPageResult_organization$key} from '../../__generated__/ReportPageResult_organization.graphql'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportNotes from './ReportNotes'
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
            ...ReportTeamHealthView_teamHealth
          }
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
        {report ? (
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
      {report && <ReportNotes orgId={orgId} resultRef={report} />}
    </>
  )
}

export default ReportPageResult
