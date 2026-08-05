/**
 * A message container used to alert the user to an error.
 * Looks something like:
 *   [ (!) Your Message Here ]
 *
 */
import {Warning} from '@mui/icons-material'

interface Props {
  message: string
}

const ErrorAlert = ({message}: Props) => {
  return (
    <div
      className='mb-4 flex items-center overflow-x-auto rounded-[2px] bg-tomato-100 px-4 py-2 text-[14px]'
      role='alert'
    >
      <Warning className='mr-2 h-[18px] w-[18px]' />
      <span>{message}</span>
    </div>
  )
}

export default ErrorAlert
