import {Link} from 'react-router'
import {ArrowForward, Check} from '~/ui/icons'
import {Button} from '../../ui/Button/Button'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {TEAM_HEALTH_DETAILS_URL} from './teamHealthDetailsUrl'

export type TranscriptionProvider = 'Google Meet' | 'Zoom'

const BENEFITS = [
  'The transcript of your call is imported automatically once the meeting ends',
  'It lands on the meeting summary, next to the scores and the discussion',
  'Nobody has to take notes, so the whole team can stay in the conversation'
]

interface Props {
  provider: TranscriptionProvider | null
  onClose: () => void
}

const TranscriptionPreviewDialog = (props: Props) => {
  const {provider, onClose} = props
  return (
    <Dialog isOpen={!!provider} onClose={onClose}>
      <DialogContent className='max-w-md'>
        <DialogTitle className='font-bold text-fg-primary text-xl'>
          Connect {provider} on a real team
        </DialogTitle>
        <p className='mt-2 mb-0 text-fg-secondary text-sm leading-5'>
          This is a sample meeting, so there is no account to connect. On your own team, connecting{' '}
          {provider} gets you:
        </p>
        <ul className='m-0 mt-4 flex list-none flex-col gap-3 p-0'>
          {BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className='flex items-start gap-2.5 text-fg-primary text-sm leading-5'
            >
              <Check className='mt-0.5 size-4 shrink-0 text-jade-500' />
              {benefit}
            </li>
          ))}
        </ul>
        <Button asChild variant='primary' size='md' className='mt-6 w-full gap-2'>
          <Link to={TEAM_HEALTH_DETAILS_URL}>
            Start Team Health
            <ArrowForward className='size-4' />
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default TranscriptionPreviewDialog
