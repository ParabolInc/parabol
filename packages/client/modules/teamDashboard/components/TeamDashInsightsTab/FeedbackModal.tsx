import {RadioButtonChecked, RadioButtonUnchecked, ThumbDown, ThumbUp} from '@mui/icons-material'
import {useCallback, useState} from 'react'
import BasicTextArea from '../../../../components/InputField/BasicTextArea'
import PrimaryButton from '../../../../components/PrimaryButton'
import useManualClientSideTrack from '../../../../hooks/useManualClientSideTrack'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'

type Props = {
  isOpen: boolean
  onClose: () => void
}

type FeedbackState = {
  isUseful: boolean
  feedback: string
  canEmail: boolean
}

const defaultFeedbackState: FeedbackState = {
  isUseful: true,
  feedback: '',
  canEmail: true
}

const InsightsFeedbackModal = (props: Props) => {
  const {isOpen, onClose} = props
  const [feedbackState, setFeedbackState] = useState(defaultFeedbackState)
  const trackEvent = useManualClientSideTrack()

  const handleSubmit = useCallback(() => {
    trackEvent('Insights Feedback Submitted', feedbackState)
    onClose()
    setFeedbackState(defaultFeedbackState)
  }, [trackEvent, feedbackState, onClose])

  const handleClose = useCallback(() => {
    onClose()
    setFeedbackState(defaultFeedbackState)
  }, [onClose])

  const updateField = useCallback((field: keyof FeedbackState, value: any) => {
    setFeedbackState((prev) => ({...prev, [field]: value}))
  }, [])

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <DialogContent>
        <DialogTitle>Insights Feedback</DialogTitle>
        <div className='mt-4 flex items-center justify-between'>
          <p className='font-semibold'>Were these insights useful?</p>
          <div className='flex space-x-4'>
            <button
              onClick={() => updateField('isUseful', true)}
              className='group flex items-center space-x-2 bg-transparent hover:cursor-pointer'
            >
              <ThumbUp
                className={`transition-colors duration-200 ${feedbackState.isUseful ? 'text-sky-500' : 'text-slate-500 group-hover:text-sky-500'}`}
              />
              <span
                className={`transition-colors duration-200 ${feedbackState.isUseful ? 'text-sky-500' : 'text-slate-600 group-hover:text-sky-500'}`}
              >
                Yes
              </span>
            </button>
            <button
              onClick={() => updateField('isUseful', false)}
              className='group flex items-center space-x-2 bg-transparent hover:cursor-pointer'
            >
              <ThumbDown
                className={`transition-colors duration-200 ${!feedbackState.isUseful ? 'text-sky-500' : 'text-slate-500 group-hover:text-sky-500'}`}
              />
              <span
                className={`transition-colors duration-200 ${!feedbackState.isUseful ? 'text-sky-500' : 'text-slate-600 group-hover:text-sky-500'}`}
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
            value={feedbackState.feedback}
            onChange={(e) => updateField('feedback', e.target.value)}
            placeholder='Your feedback here...'
          />
        </div>
        <div className='mt-4'>
          <p className='mb-2 font-bold'>May we email you to talk more regarding your feedback?</p>
          <div className='flex space-x-4'>
            <button
              onClick={() => updateField('canEmail', true)}
              className='flex items-center space-x-2 bg-transparent hover:cursor-pointer'
            >
              {feedbackState.canEmail ? (
                <RadioButtonChecked className='text-sky-500' />
              ) : (
                <RadioButtonUnchecked className='text-slate-500' />
              )}
              <span>Yes, you may email me</span>
            </button>
            <button
              onClick={() => updateField('canEmail', false)}
              className='flex items-center space-x-2 bg-transparent hover:cursor-pointer'
            >
              {!feedbackState.canEmail ? (
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
