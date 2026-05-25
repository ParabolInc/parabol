import {cn} from '../ui/cn'
import DialogContainer from './DialogContainer'

interface Props {
  seriesTitle: string
  onConfirm: () => void
  closeModal: () => void
}

const ACTION_BUTTON_CLASSES =
  'font-sans text-base font-medium cursor-pointer text-center rounded-full px-4 py-2'

export const CancelSeriesConfirmationModal = (props: Props) => {
  const {seriesTitle, onConfirm, closeModal} = props
  return (
    <DialogContainer className='p-4'>
      <div className='mb-2 font-semibold text-xl'>Cancel scheduled meeting?</div>
      <p className='mb-4 text-slate-700 text-sm'>
        “{seriesTitle}” will not recur and the first meeting will not start automatically. You can
        re-schedule it later.
      </p>
      <div className='flex justify-end gap-2.5'>
        <button
          className={cn(
            'border border-slate-400 border-solid bg-white text-slate-700 hover:bg-slate-100',
            ACTION_BUTTON_CLASSES
          )}
          onClick={closeModal}
        >
          Keep series
        </button>
        <button
          className={cn('bg-tomato-500 text-white hover:bg-tomato-600', ACTION_BUTTON_CLASSES)}
          onClick={onConfirm}
        >
          Cancel series
        </button>
      </div>
    </DialogContainer>
  )
}
