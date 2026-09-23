import * as Popover from '@radix-ui/react-popover'
import {useState} from 'react'
import PlainButton from '~/components/PlainButton/PlainButton'
import {cn} from '~/ui/cn'
import {AddReactionOutlined as AddReactionOutlinedIcon} from '~/ui/icons'
import ReactjiPicker from '../ReactjiPicker'
import type {ReactjiSize} from './reactjiSize'

interface Props {
  className?: string
  onToggle: (emojiId: string) => void
  size?: ReactjiSize
}

const AddReactjiButton = (props: Props) => {
  const {className, onToggle, size = 'sm'} = props
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
          aria-label='Add reaction'
          className={cn(
            'leading-6 hover:text-fg-primary focus:text-fg-primary active:text-fg-primary',
            size === 'lg' ? 'flex h-10 w-10 items-center justify-center' : 'block h-6 w-6 py-0.75',
            className
          )}
        >
          <AddReactionOutlinedIcon className={size === 'lg' ? 'h-5 w-5' : 'h-4.5 w-4.5'} />
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
