import PlainButton from './PlainButton/PlainButton'
import type {SnackAction} from './Snackbar'

interface Props {
  action: SnackAction | null | undefined
}

const SnackbarMessageAction = (props: Props) => {
  const {action} = props
  if (!action) return null
  const {label, callback} = action
  return (
    <PlainButton
      className='ml-2 whitespace-nowrap rounded-sm bg-[#ffffff17] p-2 font-semibold text-rose-500 text-sm leading-[normal] transition-[background] duration-100 ease-out hover:bg-[#ffffff26] focus:bg-[#ffffff26] active:bg-[#ffffff26]'
      onClick={() => {
        // claude added this & i'm not sure why, we want it to propagate up to dismiss
        // e.stopPropagation()
        callback()
      }}
    >
      {label}
    </PlainButton>
  )
}

export default SnackbarMessageAction
