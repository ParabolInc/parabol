import {ThumbUp} from '~/ui/icons'
import getRallyLink from '../modules/userDashboard/helpers/getRallyLink'

const TimelineNoTasks = () => {
  return (
    <div className='flex flex-col items-center justify-center pt-16'>
      <ThumbUp className='mb-4 h-12 w-12' />
      {'You’re all caught up!'}
      <span className='font-semibold text-accent'>{getRallyLink()}</span>
    </div>
  )
}

export default TimelineNoTasks
