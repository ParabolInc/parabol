import styled from '@emotion/styled'
import {forwardRef, Ref} from 'react'
import useModal from '~/hooks/useModal'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import MenuContents, {MenuContentsProps} from './MenuContents'
import PrimaryButton from './PrimaryButton'
import ReportErrorFeedback from './ReportErrorFeedback'

interface Props extends MenuContentsProps {
  error: Error
  eventId: string
}

const ErrorBlock = styled(MenuContents)({
  background: '#fff',
  padding: 16
})

const Button = styled(PrimaryButton)({
  marginTop: 8
})

const ModalError = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {error, eventId, ...blockProps} = props
  const {modalPortal, openPortal, closePortal} = useModal()
  return (
    <ErrorBlock {...blockProps} ref={ref}>
      <DialogTitle>You found a bug!</DialogTitle>
      <DialogContent>
        {'We’ve alerted the developers. Try refreshing the page'}
        <Button onClick={openPortal}>Report Feedback</Button>
        {modalPortal(<ReportErrorFeedback closePortal={closePortal} eventId={eventId} />)}
      </DialogContent>
    </ErrorBlock>
  )
})

export default ModalError
