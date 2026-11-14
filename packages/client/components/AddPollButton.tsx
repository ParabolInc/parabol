import {PollOutlined} from '~/ui/icons'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  onClick: () => void
  disabled?: boolean
}

const AddPollButton = (props: Props) => {
  const {onClick, disabled} = props

  return (
    <PlainButton
      className='mx-2 flex items-center justify-center font-semibold text-[14px] text-accent [transition:color_0.1s_ease] hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
      onClick={onClick}
      disabled={disabled}
    >
      <PollOutlined className='mr-1 h-5 w-5' />
      <div>Add a poll</div>
    </PlainButton>
  )
}

export default AddPollButton
