import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import type {ReportNotes_result$key} from '../../__generated__/ReportNotes_result.graphql'
import {MIN_RESPONDENTS_FOR_SCORE} from '../../shared/utils/teamHealthAnonymity'
import plural from '../../utils/plural'

interface Props {
  orgId: string
  resultRef: ReportNotes_result$key
  // a Team Health heatmap by team says on each hidden team's row why it's hidden
  hasHiddenTeamRows: boolean
}

const ReportNotes = ({orgId, resultRef, hasHiddenTeamRows}: Props) => {
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
  // the view says why a stopped report shows nothing
  const shownNotes = notes.filter(
    ({kind}) =>
      kind !== 'FILTER_LEVEL_REMOVED' && !(kind === 'HIDDEN_FOR_ANONYMITY' && hasHiddenTeamRows)
  )
  if (shownNotes.length === 0) return null
  return (
    <ul className='m-0 flex list-none flex-col gap-1 border-hairline border-t px-5 py-3 text-fg-secondary text-sm'>
      {shownNotes.map(({kind, count}) => (
        <li key={kind}>
          {kind === 'STARTER_LIMIT' && (
            <>
              {count} {plural(count, 'team')} left out on the Starter plan.{' '}
              <Link
                to={`/me/organizations/${orgId}/billing`}
                className='font-semibold text-sky-600 hover:underline dark:text-accent'
              >
                Upgrade
              </Link>
            </>
          )}
          {kind === 'ESTIMATED_HISTORY' &&
            `Done dates are estimated for ${count.toLocaleString()} older ${plural(count, 'task')}`}
          {kind === 'ROWS_TRUNCATED' &&
            `Too many rows to show all ${count.toLocaleString()}. Add a filter or a limit`}
          {kind === 'HIDDEN_FOR_ANONYMITY' &&
            `${count} ${plural(count, 'check')} hidden for anonymity: fewer than ${MIN_RESPONDENTS_FOR_SCORE} people answered`}
          {kind === 'TOPICS_FROM_OWN_TEAMS' &&
            `${count} ${plural(count, 'team')} left out: topics only come from teams you’re on`}
          {kind === 'NOTHING_TO_COMPARE' &&
            'Nothing to compare: nothing was recorded in the earlier period'}
          {kind === 'STRUCTURE_LEVEL_REMOVED' &&
            `${count === 1 ? 'A structure level was' : `${count} structure levels were`} removed, so this lists teams instead`}
        </li>
      ))}
    </ul>
  )
}

export default ReportNotes
