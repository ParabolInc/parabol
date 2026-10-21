import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ReportsHeadline_organization$key} from '../../__generated__/ReportsHeadline_organization.graphql'
import plural from '../../utils/plural'
import ReportHeadlineNumber from './ReportHeadlineNumber'
import {sumReportValues} from './reportRows'

interface Props {
  organizationRef: ReportsHeadline_organization$key
}

const PREVIOUS_30_DAYS = 'vs. the 30 days before'

interface HeadlineRow {
  values: readonly (number | null | undefined)[]
  previousValues: readonly (number | null | undefined)[] | null | undefined
}

const changeOf = (rows: readonly HeadlineRow[]) =>
  sumReportValues(rows.map(({values}) => values[0])) -
  sumReportValues(rows.map(({previousValues}) => previousValues?.[0]))

// The four numbers at the top of the page always cover the last 30 days, whatever the page's period
const ReportsHeadline = ({organizationRef}: Props) => {
  const {activePeople, teamsThatMet, userIntegrations, tasksPushed} = useFragment(
    graphql`
      fragment ReportsHeadline_organization on Organization {
        activePeople: report(
          spec: {
            measures: [ACTIVE_PEOPLE, MEMBERS]
            period: {preset: LAST_30_DAYS}
            compareTo: PREVIOUS_PERIOD
            showAs: TABLE
          }
          timeZone: $timeZone
        ) {
          rows {
            values
            previousValues
          }
        }
        teamsThatMet: report(
          spec: {
            measures: [TEAMS_THAT_MET]
            period: {preset: LAST_30_DAYS}
            compareTo: PREVIOUS_PERIOD
            showAs: NUMBER
          }
          timeZone: $timeZone
        ) {
          teamCount
          rows {
            values
            previousValues
          }
        }
        userIntegrations: report(
          spec: {
            measures: [USER_INTEGRATIONS]
            breakdown: [{dimension: INTEGRATION}]
            period: {preset: LAST_30_DAYS}
            compareTo: PREVIOUS_PERIOD
            showAs: TABLE
          }
          timeZone: $timeZone
        ) {
          rows {
            values
            previousValues
          }
        }
        tasksPushed: report(
          spec: {
            measures: [TASKS_PUSHED]
            breakdown: [{dimension: MEETING_TYPE}]
            period: {preset: LAST_30_DAYS}
            compareTo: PREVIOUS_PERIOD
            showAs: TABLE
          }
          timeZone: $timeZone
        ) {
          rows {
            keys {
              value
            }
            values
            previousValues
          }
        }
      }
    `,
    organizationRef
  )
  const [active] = activePeople.rows
  const activeCount = active?.values[0] ?? 0
  const memberCount = active?.values[1] ?? 0
  const teamsThatMetCount = teamsThatMet.rows[0]?.values[0] ?? 0
  const integrationCount = sumReportValues(userIntegrations.rows.map(({values}) => values[0]))
  const serviceCount = userIntegrations.rows.filter(({values}) => (values[0] ?? 0) > 0).length
  const pushedCount = sumReportValues(tasksPushed.rows.map(({values}) => values[0]))
  // Sprint Poker brings each story in as a task, so the poker row is the stories
  const storyCount = sumReportValues(
    tasksPushed.rows.filter(({keys}) => keys[0]?.value === 'poker').map(({values}) => values[0])
  )
  const taskCount = pushedCount - storyCount
  return (
    <div className='grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4'>
      <ReportHeadlineNumber
        label='Active people, 30 days'
        value={activeCount}
        detail={
          memberCount > 0
            ? `${Math.round((activeCount / memberCount) * 100)}% of members`
            : 'no members yet'
        }
        change={changeOf(activePeople.rows)}
        comparison={PREVIOUS_30_DAYS}
      />
      <ReportHeadlineNumber
        label='Teams that met, 30 days'
        value={teamsThatMetCount}
        detail={`of ${teamsThatMet.teamCount} ${plural(teamsThatMet.teamCount, 'team')}`}
        change={changeOf(teamsThatMet.rows)}
        comparison={PREVIOUS_30_DAYS}
      />
      <ReportHeadlineNumber
        label='User integrations'
        value={integrationCount}
        detail={`across ${serviceCount} ${plural(serviceCount, 'service')}`}
        change={changeOf(userIntegrations.rows)}
        comparison='vs. 30 days ago'
      />
      <ReportHeadlineNumber
        label='Pushed to integrations, 30 days'
        value={pushedCount}
        detail={`${storyCount} poker ${plural(storyCount, 'story', 'stories')}, ${taskCount} ${plural(taskCount, 'task')}`}
        change={changeOf(tasksPushed.rows)}
        comparison={PREVIOUS_30_DAYS}
      />
    </div>
  )
}

export default ReportsHeadline
