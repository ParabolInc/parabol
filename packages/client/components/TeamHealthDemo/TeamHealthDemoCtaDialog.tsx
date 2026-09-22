import {Link} from 'react-router'
import {ArrowForward} from '~/ui/icons'
import {Button} from '../../ui/Button/Button'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import TeamHealthSurveyFlowAnimation from '../ActivityLibrary/TeamHealth/TeamHealthSurveyFlowAnimation'
import {TEAM_HEALTH_DETAILS_URL} from './teamHealthDetailsUrl'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const TeamHealthDemoCtaDialog = (props: Props) => {
  const {isOpen, onClose} = props
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='max-w-xl'>
        <div className='flex flex-col items-center text-center'>
          <DialogTitle className='font-bold text-2xl text-fg-primary'>
            Ready for real results?
          </DialogTitle>
          <p className='mt-2 mb-0 max-w-lg text-fg-secondary'>
            Each check draws one question per category, the team answers anonymously in about 2
            minutes, and every result adds a point to the trend.
          </p>
          <div className='mt-6 w-full rounded-lg bg-surface-well p-2'>
            <TeamHealthSurveyFlowAnimation className='mx-auto' />
          </div>
          <Button asChild variant='primary' size='lg' className='mt-6 gap-2 px-6'>
            <Link to={TEAM_HEALTH_DETAILS_URL}>
              Start Team Health
              <ArrowForward className='size-5' />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TeamHealthDemoCtaDialog
