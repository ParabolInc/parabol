import {Close as CloseIcon} from '@mui/icons-material'

interface Props {
  onClose: (...args: any[]) => void
  message: string
}

const OutcomeCardMessage = (props: Props) => {
  const {onClose, message} = props
  return (
    <div className='px-4 pb-4'>
      <div className='relative block rounded-sm bg-tomato-500 p-[15px] pr-[22px] font-semibold text-[13px] text-white leading-[18px] [text-shadow:0_1px_rgba(0,0,0,.15)]'>
        {message}
        <div
          className='absolute top-0 right-0 cursor-pointer p-1 text-[0px] outline-none [text-shadow:0_1px_rgba(0,0,0,.15)] hover:opacity-50 focus:opacity-50'
          onClick={onClose}
          tabIndex={0}
        >
          <div className='h-[18px] w-[18px] text-white [&_svg]:text-[18px]'>
            <CloseIcon />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OutcomeCardMessage
