import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthClosedCheck_teamHealthMeeting$key} from '~/__generated__/RetroTeamHealthClosedCheck_teamHealthMeeting.graphql'
import {ArrowForward, Schedule} from '~/ui/icons'
import {Button} from '../../ui/Button/Button'

interface Props {
  nextTeamHealthMeeting: RetroTeamHealthClosedCheck_teamHealthMeeting$key | null
  hasResults: boolean
  onGotoResults?: () => void
  onDismiss: () => void
}

const RetroTeamHealthClosedCheck = (props: Props) => {
  const {nextTeamHealthMeeting: nextRef, hasResults, onGotoResults, onDismiss} = props
  const nextTeamHealthMeeting = useFragment(
    graphql`
      fragment RetroTeamHealthClosedCheck_teamHealthMeeting on TeamHealthMeeting {
        name
        scheduledEndTime
        phases {
          phaseType
          stages {
            id
          }
        }
      }
    `,
    nextRef
  )
  const nextQuestionCount =
    nextTeamHealthMeeting?.phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH_RESPONSE')
      ?.stages.length ?? 0
  const nextScheduledEndTime = nextTeamHealthMeeting?.scheduledEndTime
  return (
    <div className='flex w-full justify-center px-6 py-8'>
      <section className='flex w-full max-w-lg flex-col items-center rounded-2xl bg-surface-card p-8 text-center shadow-card'>
        <span className='flex size-14 items-center justify-center rounded-2xl bg-gold-100 dark:bg-gold-900'>
          <Schedule className='text-gold-700 dark:text-gold-200' />
        </span>
        <h2 className='mt-6 mb-0 font-bold text-3xl text-fg-primary'>
          The check you were answering just closed
        </h2>
        <p className='mt-2 mb-0 text-balance text-fg-secondary'>
          {hasResults
            ? 'The answers you gave were counted, and its results are now in Health Results.'
            : 'The answers you gave were counted.'}
        </p>
        {onGotoResults && (
          <Button
            variant='link'
            size='md'
            className='mt-3 gap-1 font-bold text-accent'
            onClick={onGotoResults}
          >
            Go to Health Results
            <ArrowForward className='size-4' />
          </Button>
        )}
        {nextTeamHealthMeeting ? (
          <div className='mt-6 flex w-full flex-col items-center gap-1 border-hairline border-t pt-6'>
            <span className='font-semibold text-fg-primary text-lg'>{`${nextTeamHealthMeeting.name} is open`}</span>
            <span className='text-fg-secondary text-sm'>
              {`${nextQuestionCount} new questions`}
              {nextScheduledEndTime &&
                ` · open until ${dayjs(nextScheduledEndTime).format('ddd, MMM D')}`}
            </span>
            <Button
              variant='primary'
              shape='default'
              size='lg'
              className='mt-3 gap-2'
              onClick={onDismiss}
            >
              Answer the new check
              <ArrowForward className='size-5' />
            </Button>
          </div>
        ) : (
          <Button variant='ghost' shape='default' size='md' className='mt-6' onClick={onDismiss}>
            Got it
          </Button>
        )}
      </section>
    </div>
  )
}

export default RetroTeamHealthClosedCheck
