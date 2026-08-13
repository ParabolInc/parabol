import {Chat} from '~/ui/icons'
import {Button} from '../ui/Button/Button'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'

interface Props {
  isOpen: boolean
  startDemo: () => void
}

const BeginDemoModal = (props: Props) => {
  const {isOpen, startDemo} = props

  return (
    <Dialog isOpen={isOpen}>
      <DialogContent noClose>
        <div className='flex flex-col items-center px-4 pb-8'>
          <Chat className='h-12 w-12 text-sky-500' />
          <p className='mx-0 mt-4 mb-6 p-0 text-center text-[16px] leading-normal'>
            Try Parabol for yourself by holding a 2-minute retrospective meeting with our simulated
            colleagues
          </p>
          <Button variant='primary' data-cy='start-demo-button' onClick={startDemo} size='md'>
            Start Demo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BeginDemoModal
