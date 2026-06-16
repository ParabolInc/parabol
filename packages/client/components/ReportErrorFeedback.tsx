import type * as React from 'react'
import {useEffect, useState} from 'react'
import {LocalStorageKey} from '../types/constEnums'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import BasicTextArea from './InputField/BasicTextArea'
import PrimaryButton from './PrimaryButton'

interface Props {
  isOpen: boolean
  onClose: () => void
  error: Error
  eventId: string
}

const parseFormConfig = () => {
  const rawUrl = window.__ACTION__.GOOGLE_ERROR_FORM_URL
  if (!rawUrl) return null
  try {
    const parsed = new URL(rawUrl)
    const emailField = parsed.searchParams.get('_email')
    const subjectField = parsed.searchParams.get('_subject')
    const contentField = parsed.searchParams.get('_content')
    const eventIdField = parsed.searchParams.get('_eventId')
    if (!emailField || !subjectField || !contentField || !eventIdField) return null
    parsed.searchParams.delete('_email')
    parsed.searchParams.delete('_subject')
    parsed.searchParams.delete('_content')
    parsed.searchParams.delete('_eventId')
    return {url: parsed.toString(), emailField, subjectField, contentField, eventIdField}
  } catch {
    return null
  }
}

const formConfig = parseFormConfig()
export const ERROR_FEEDBACK_ENABLED = !!formConfig

const ReportErrorFeedback = (props: Props) => {
  const {isOpen, onClose, error, eventId} = props
  const [text, setText] = useState('')
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value
    setText(nextValue)
  }
  useEffect(() => {
    if (!formConfig) {
      onClose()
    }
  }, [onClose])
  if (!formConfig) {
    return null
  }
  const email = window.localStorage.getItem(LocalStorageKey.EMAIL)

  const onSubmit = () => {
    if (!text) return
    const {url, emailField, subjectField, contentField, eventIdField} = formConfig
    const body = new URLSearchParams({
      [emailField]: email || 'errors@parabol.co',
      [subjectField]: error.message,
      [contentField]: text,
      [eventIdField]: eventId
    })
    fetch(url, {method: 'POST', mode: 'no-cors', body})
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogTitle className='mb-4'>Report Error</DialogTitle>
        <div className='mb-4 pl-0 text-slate-700 text-sm'>
          What were you doing when the error happened?
        </div>
        <BasicTextArea autoFocus name='errorReport' onChange={onChange} value={text} />
        <div className='mt-6 flex justify-end'>
          <PrimaryButton onClick={onSubmit} disabled={text.length === 0} size='medium'>
            {'Submit Report'}
          </PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReportErrorFeedback
