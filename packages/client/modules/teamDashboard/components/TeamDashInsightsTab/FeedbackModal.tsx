import {RadioButtonChecked, RadioButtonUnchecked, ThumbDown, ThumbUp} from '@mui/icons-material'
import * as React from 'react'
import BasicTextArea from '../../../../components/InputField/BasicTextArea'
import PrimaryButton from '../../../../components/PrimaryButton'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const InsightsFeedbackModal = (props: Props) => {
  const {isOpen, onClose} = props
  const [isUseful, setIsUseful] = React.useState<boolean | null>(null)
  const [feedback, setFeedback] = React.useState('')
  const [canEmail, setCanEmail] = React.useState<boolean>(true) // Default to true

  const handleSubmit = () => {
    console.log({isUseful, feedback, canEmail})
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogTitle>Insights Feedback</DialogTitle>
        <div className='mt-4 flex items-center justify-between'>
          <p className='font-semibold'>Were these insights useful?</p>
          <div className='flex space-x-4'>
            <button
              onClick={() => setIsUseful(true)}
              className='group flex items-center space-x-2 bg-transparent hover:cursor-pointer'
            >
              <ThumbUp
                className={`transition-colors duration-200 ${isUseful === true ? 'text-sky-500' : 'text-slate-500 group-hover:text-sky-500'}`}
              />
              <span
                className={`transition-colors duration-200 ${isUseful === true ? 'text-sky-500' : 'text-slate-500 group-hover:text-sky-500'}`}
              >
                Yes
              </span>
            </button>
            <button
              onClick={() => setIsUseful(false)}
              className='group flex items-center space-x-2 bg-transparent hover:cursor-pointer'
            >
              <ThumbDown
                className={`transition-colors duration-200 ${isUseful === false ? 'text-sky-500' : 'text-slate-500 group-hover:text-sky-500'}`}
              />
              <span
                className={`transition-colors duration-200 ${isUseful === false ? 'text-sky-500' : 'text-slate-500 group-hover:text-sky-500'}`}
              >
                No
              </span>
            </button>
          </div>
        </div>
        <div className='mt-4'>
          <p className='mb-2 font-semibold'>Additional feedback (optional):</p>
          <BasicTextArea
            name='feedback'
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder='Your feedback here...'
          />
        </div>
        <div className='mt-4'>
          <p className='mb-2 font-bold'>May we email you to talk more regarding your feedback?</p>
          <div className='flex space-x-4'>
            <button
              onClick={() => setCanEmail(true)}
              className='flex items-center space-x-2 bg-transparent hover:cursor-pointer'
            >
              {canEmail ? (
                <RadioButtonChecked className='text-sky-500' />
              ) : (
                <RadioButtonUnchecked className='text-slate-500' />
              )}
              <span>Yes, you may email me</span>
            </button>
            <button
              onClick={() => setCanEmail(false)}
              className='flex items-center space-x-2 bg-transparent hover:cursor-pointer'
            >
              {!canEmail ? (
                <RadioButtonChecked className='text-sky-500' />
              ) : (
                <RadioButtonUnchecked className='text-slate-500' />
              )}
              <span>No, please don't email me</span>
            </button>
          </div>
        </div>
        <DialogActions>
          <PrimaryButton onClick={handleSubmit} size='medium'>
            Submit
          </PrimaryButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default InsightsFeedbackModal
