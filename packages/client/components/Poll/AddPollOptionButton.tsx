import {PollsAriaLabels} from '~/types/constEnums'
import {AddOutlined} from '~/ui/icons'
import PlainButton from '../PlainButton/PlainButton'

interface Props {
  onClick: () => void
  disabled?: boolean
}

export const AddPollOptionButton = (props: Props) => {
  const {onClick, disabled} = props

  return (
    <PlainButton
      aria-label={PollsAriaLabels.POLL_ADD_OPTION}
      onClick={onClick}
      disabled={disabled}
      className='mr-auto flex items-center justify-center font-semibold text-[14px] text-fg-secondary [transition:color_0.1s_ease] hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'
    >
      <AddOutlined className='mx-1 h-5 w-5' />
      <div>Add another choice</div>
    </PlainButton>
  )
}
