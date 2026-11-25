import {Link} from '@tanstack/react-router'
import {ArrowForward, Schedule} from '~/ui/icons'
import {Button} from '../../ui/Button/Button'

interface Props {
  teamHealthMeetingId: string
}

const RetroTeamHealthCheckStillOpen = (props: Props) => {
  const {teamHealthMeetingId} = props
  return (
    <div className='flex w-full justify-center px-6 py-8'>
      <section className='flex w-full max-w-md flex-col items-center rounded-3xl bg-surface-card px-8 py-10 text-center shadow-card-raised'>
        <span className='flex size-14 items-center justify-center rounded-2xl bg-surface-well'>
          <Schedule className='text-fg-secondary' />
        </span>
        <h2 className='mt-6 mb-0 text-balance font-bold text-3xl text-fg-primary'>
          The check is still open
        </h2>
        <p className='mt-2 mb-0 text-balance text-fg-secondary'>
          This retro has ended, but its Team Health check is still taking answers on its own page.
          Its results show up here once they’re revealed.
        </p>
        <Button asChild variant='primary' size='lg' className='mt-6 gap-2 px-6'>
          <Link to='/meet/$meetingId' params={{meetingId: teamHealthMeetingId}}>
            Go to the check
            <ArrowForward className='size-5' />
          </Link>
        </Button>
      </section>
    </div>
  )
}

export default RetroTeamHealthCheckStillOpen
