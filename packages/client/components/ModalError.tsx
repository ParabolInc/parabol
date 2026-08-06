import {forwardRef, type Ref, useState} from 'react'
import {Button} from '../ui/Button/Button'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import MenuContents, {type MenuContentsProps} from './MenuContents'
import ReportErrorFeedback from './ReportErrorFeedback'

interface Props extends MenuContentsProps {
  error: Error
  eventId: string
}

const ModalError = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {error, eventId, ...blockProps} = props
  const [isOpen, setIsOpen] = useState(false)
  return (
    <MenuContents {...blockProps} className='bg-surface-card p-4' ref={ref}>
      <DialogTitle>You found a bug!</DialogTitle>
      <DialogContent>
        {"We've alerted the developers. Try refreshing the page"}
        <Button
          variant='primary'
          size='sm'
          className='mt-2 text-sm'
          onClick={() => setIsOpen(true)}
        >
          Report Feedback
        </Button>
        <ReportErrorFeedback
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          eventId={eventId}
          error={error}
        />
      </DialogContent>
    </MenuContents>
  )
})

export default ModalError
