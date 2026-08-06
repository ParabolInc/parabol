import type * as React from 'react'
import TextAreaAutoSize from 'react-textarea-autosize'
import useBreakpoint from '~/hooks/useBreakpoint'
import useForm from '~/hooks/useForm'
import {Breakpoint} from '~/types/constEnums'
import {Info} from '~/ui/icons'
import Legitity from '~/validation/Legitity'
import {cn} from '../../ui/cn'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import RaisedButton from '../RaisedButton'

const SUGGESTED_PROMPTS = [
  'What’s changed with your tasks?',
  'What will you do today?',
  'What have you done since yesterday?',
  'What did you learn today?',
  'What’s got your attention today?',
  'What are you working on today? Stuck on anything?'
]

interface Props {
  isOpen: boolean
  initialPrompt: string
  onCloseModal: () => void
  onSubmitUpdatePrompt: (newPrompt: string) => void
  onCompleted: () => void
  error?: string
}

const TeamPromptEditablePromptModal = (props: Props) => {
  const {isOpen, initialPrompt, onCloseModal, onSubmitUpdatePrompt, error} = props
  const {
    validateField,
    setDirtyField,
    setValue,
    onChange: onChangePrompt,
    fields
  } = useForm({
    meetingPrompt: {
      getDefault: () => initialPrompt,
      validate: (rawMeetingPrompt) => {
        return new Legitity(rawMeetingPrompt)
          .trim()
          .required('A prompt is required to start the activity')
          .min(2, 'Prompts should be at least two characters long')
      }
    }
  })

  const displayError = fields.meetingPrompt.error ?? error
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const handleSubmitUpdate = () => {
    setDirtyField()
    const {meetingPrompt: meetingPromptRes} = validateField()
    if (meetingPromptRes.error) return
    const {value: meetingPrompt} = meetingPromptRes
    onSubmitUpdatePrompt(meetingPrompt)
    onCloseModal()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onCloseModal}>
      <DialogContent className='w-[860px] max-w-[95vw] overflow-auto'>
        <DialogTitle>Prompt</DialogTitle>
        <TextAreaAutoSize
          {...fields.meetingPrompt}
          className={cn(
            'block w-full resize-none rounded-lg border border-hairline-field bg-transparent p-6 font-normal leading-[23.4px] outline-none',
            isDesktop ? 'text-[18px]' : 'text-[16px]'
          )}
          onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => e.target.select()}
          name='meetingPrompt'
          autoFocus={true}
          maxLength={500}
          maxRows={3}
          onChange={onChangePrompt}
          placeholder='What are you working on today? Stuck on anything?'
        />
        {displayError && (
          <div className='mt-4 flex items-center text-[13px] text-rose-500'>
            <Info className='mr-2 h-[18px] w-[18px] text-fg-muted' />
            {displayError}
          </div>
        )}
        <h3 className='text-[20px]'>Suggestions</h3>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <div
            className={cn(
              'cursor-pointer px-1.5 py-2 hover:bg-surface-raised',
              isDesktop ? 'text-[18px]' : 'text-[16px]'
            )}
            key={i}
            onClick={() => setValue('meetingPrompt', prompt)}
          >
            <span className='mr-3'>💡</span>
            {prompt}
          </div>
        ))}
        <div className='flex justify-end pt-6'>
          <RaisedButton
            className='ml-4 py-3 text-[18px]'
            disabled={!!fields.meetingPrompt.error}
            onClick={handleSubmitUpdate}
            size='medium'
            palette='blue'
          >
            Use prompt
          </RaisedButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TeamPromptEditablePromptModal
