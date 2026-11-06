import type * as React from 'react'
import {useState} from 'react'
import useSubmitErrorFeedbackMutation from '../mutations/useSubmitErrorFeedbackMutation'
import {LocalStorageKey} from '../types/constEnums'
import {Button} from '../ui/Button/Button'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import BasicTextArea from './InputField/BasicTextArea'

interface Props {
  isOpen: boolean
  onClose: () => void
  error: Error
  eventId: string
}

const ReportErrorFeedback = (props: Props) => {
  const {isOpen, onClose, error, eventId} = props
  const [text, setText] = useState('')
  const [submitError, setSubmitError] = useState<string>()
  const [execute, submitting] = useSubmitErrorFeedbackMutation()
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    setSubmitError(undefined)
  }

  const onSubmit = () => {
    if (!text.trim() || submitting) return
    const email = window.localStorage.getItem(LocalStorageKey.EMAIL)
    execute({
      variables: {
        errorMessage: error.message,
        content: text,
        eventId,
        email
      },
      onCompleted: (_res, errors) => {
        if (errors?.length) {
          setSubmitError(errors[0]!.message)
          return
        }
        setText('')
        onClose()
      },
      onError: (err) => setSubmitError(err.message)
    })
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogTitle className='mb-4'>Report Error</DialogTitle>
        <div className='mb-4 pl-0 text-fg-primary text-sm'>
          What were you doing when the error happened?
        </div>
        <BasicTextArea
          autoFocus
          name='errorReport'
          onChange={onChange}
          value={text}
          error={submitError}
        />
        <div className='mt-6 flex justify-end'>
          <Button
            variant='primary'
            onClick={onSubmit}
            disabled={text.trim().length === 0 || submitting}
            size='md'
          >
            {'Submit Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReportErrorFeedback
