import styled from '@emotion/styled'
import {forwardRef, type Ref, useState} from 'react'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import MenuContents, {type MenuContentsProps} from './MenuContents'
import PrimaryButton from './PrimaryButton'
import ReportErrorFeedback from './ReportErrorFeedback'

interface Props extends MenuContentsProps {
  error: Error
  eventId: string
}

const ErrorBlock = styled(MenuContents)({
  background: 'var(--color-surface-card)',
  padding: 16
})

const Button = styled(PrimaryButton)({
  marginTop: 8
})

const ModalError = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {error, eventId, ...blockProps} = props
  const [isOpen, setIsOpen] = useState(false)
  return (
    <ErrorBlock {...blockProps} ref={ref}>
      <DialogTitle>You found a bug!</DialogTitle>
      <DialogContent>
        {"We've alerted the developers. Try refreshing the page"}
        <Button onClick={() => setIsOpen(true)}>Report Feedback</Button>
        <ReportErrorFeedback
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          eventId={eventId}
          error={error}
        />
      </DialogContent>
    </ErrorBlock>
  )
})

export default ModalError
