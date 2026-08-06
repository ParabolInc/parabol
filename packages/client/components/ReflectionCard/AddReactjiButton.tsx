import * as Popover from '@radix-ui/react-popover'
import {useState} from 'react'
import PlainButton from '~/components/PlainButton/PlainButton'
import {AddReactionOutlined as AddReactionOutlinedIcon} from '~/ui/icons'
import ReactjiPicker from '../ReactjiPicker'

interface Props {
  className?: string
  onToggle: (emojiId: string) => void
}

const AddReactjiButton = (props: Props) => {
  const {className, onToggle} = props
  const [open, setOpen] = useState(false)
  const onOpenChange = (willOpen: boolean) => {
    setOpen(willOpen)
  }
  const onClick = (emojiId: string) => {
    setOpen(false)
    onToggle(emojiId)
  }
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange} modal>
      <Popover.Trigger asChild>
        <PlainButton
          className={`block h-6 w-6 py-0.75 leading-6 hover:text-fg-primary focus:text-fg-primary active:text-fg-primary ${className ?? ''}`}
        >
          <AddReactionOutlinedIcon className='h-4.5 w-4.5' />
        </PlainButton>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className='z-20 data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'
          sideOffset={5}
        >
          <ReactjiPicker onClick={onClick} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default AddReactjiButton
