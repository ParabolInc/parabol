import {Link} from 'react-router'
import {ArrowForward, Check} from '~/ui/icons'
import {Button} from '../../ui/Button/Button'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {TEAM_HEALTH_DETAILS_URL} from './teamHealthDetailsUrl'

export const TRANSCRIPTION_BENEFITS = [
  'The transcript of your call is imported automatically once the meeting ends',
  'It lands on the meeting summary, next to the scores and the discussion',
  'Nobody has to take notes, so the whole team can stay in the conversation'
]

export const TASK_INTEGRATION_BENEFITS = [
  'Push a task to Jira, GitHub, GitLab, Linear or Azure DevOps without leaving the meeting',
  'The issue keeps its link back to the discussion that created it',
  'Status changes sync, so the team sees the outcome at the next check'
]

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  intro: string
  benefits: string[]
}

// the demo has no account behind it, so the integration entry points open this instead of OAuth
const TeamHealthDemoIntegrationDialog = (props: Props) => {
  const {isOpen, onClose, title, intro, benefits} = props
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='max-w-md'>
        <DialogTitle className='font-bold text-fg-primary text-xl'>{title}</DialogTitle>
        <p className='mt-2 mb-0 text-fg-secondary text-sm leading-5'>{intro}</p>
        <ul className='m-0 mt-4 flex list-none flex-col gap-3 p-0'>
          {benefits.map((benefit) => (
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

export default TeamHealthDemoIntegrationDialog
