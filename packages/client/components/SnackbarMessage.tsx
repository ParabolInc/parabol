import {Close} from '@mui/icons-material'
import * as Toast from '@radix-ui/react-toast'
import type {SnackAction} from './Snackbar'
import SnackbarMessageAction from './SnackbarMessageAction'

interface Props {
  message: string
  dismissSnack: () => void
  action?: SnackAction
  secondaryAction?: SnackAction
  showDismissButton?: boolean
}

// The snackbar chip is invariant: dark slate-700 chip in both light and dark modes
const SnackbarMessage = (props: Props) => {
  const {action, secondaryAction, message, dismissSnack, showDismissButton} = props
  return (
    <div className='pb-2 print:hidden'>
      <div
        className='pointer-events-auto z-snackbar flex select-none items-center rounded-sm bg-slate-700 p-2 shadow-snackbar'
        onClick={dismissSnack}
      >
        <Toast.Description asChild>
          <div className='px-2 py-1.5 text-sm text-white leading-[normal]'>{message}</div>
        </Toast.Description>
        <SnackbarMessageAction action={action} />
        <SnackbarMessageAction action={secondaryAction} />
        {showDismissButton && (
          <button
            className='ml-2 flex cursor-pointer items-center justify-center border-none bg-inherit p-[5px]'
            onClick={(e) => {
              e.stopPropagation()
              dismissSnack()
            }}
          >
            <Close className='h-[18px] w-[18px] text-slate-500 hover:opacity-50' />
          </button>
        )}
      </div>
    </div>
  )
}

export default SnackbarMessage
