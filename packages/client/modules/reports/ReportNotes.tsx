import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import type {ReportNotes_result$key} from '../../__generated__/ReportNotes_result.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import plural from '../../utils/plural'
import SendClientSideEvent from '../../utils/SendClientSideEvent'

interface Props {
  orgId: string
  resultRef: ReportNotes_result$key
}

const ReportNotes = ({orgId, resultRef}: Props) => {
  const {notes} = useFragment(
    graphql`
      fragment ReportNotes_result on ReportResult {
        notes {
          kind
          count
        }
      }
    `,
    resultRef
  )
  const atmosphere = useAtmosphere()
  if (notes.length === 0) return null
  const onUpgradeClick = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'reportsStarterLimit',
      upgradeTier: 'team',
      orgId
    })
  }
  return (
    <ul className='m-0 flex list-none flex-col gap-1 border-hairline border-t px-5 py-3 text-fg-secondary text-sm'>
      {notes.map(({kind, count}) => (
        <li key={kind}>
          {kind === 'STARTER_LIMIT' && (
            <>
              The Starter plan counts your organization’s 2 busiest teams, so {count}{' '}
              {plural(count, 'team')} {count === 1 ? 'isn’t' : 'aren’t'} in this report.{' '}
              <Link
                to={`/me/organizations/${orgId}/billing`}
                onClick={onUpgradeClick}
                className='font-semibold text-sky-600 hover:underline dark:text-accent'
              >
                Upgrade to count every team
              </Link>
            </>
          )}
          {kind === 'ESTIMATED_HISTORY' &&
            `${count.toLocaleString()} done ${plural(count, 'task was', 'tasks were')} finished before Parabol kept done dates, so ${count === 1 ? 'its date is' : 'their dates are'} estimated.`}
          {kind === 'ROWS_TRUNCATED' &&
            `This report has ${count.toLocaleString()} rows, more than a report can show. Add a filter or a limit to see the rest.`}
          {kind === 'HIDDEN_FOR_ANONYMITY' &&
            `${count} ${count === 1 ? 'team’s Team Health check is' : 'teams’ Team Health checks are'} hidden because fewer than 3 people answered.`}
          {kind === 'TOPICS_FROM_OWN_TEAMS' &&
            `Topics only come from the teams you’re on, so ${count} ${plural(count, 'team')} ${count === 1 ? 'isn’t' : 'aren’t'} in this report.`}
        </li>
      ))}
    </ul>
  )
}

export default ReportNotes
