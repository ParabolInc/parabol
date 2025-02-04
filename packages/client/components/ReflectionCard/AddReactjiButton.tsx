import styled from '@emotion/styled'
import * as Popover from '@radix-ui/react-popover'
import {useState} from 'react'
import PlainButton from '~/components/PlainButton/PlainButton'
import addReactjiSvg from '../../../../static/images/icons/add_reactji_24.svg'
import ReactjiPicker from '../ReactjiPicker'

const Button = styled(PlainButton)({
  display: 'block',
  height: 24,
  lineHeight: '24px',
  opacity: 0.5,
  padding: '3px 0',
  width: 24,
  ':hover, :focus': {
    opacity: 1
  }
})

const AddIcon = styled('img')({
  height: 18,
  width: 18
})

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
        <Button className={className}>
          <AddIcon alt='' src={addReactjiSvg} />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className='z-10 data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'
          sideOffset={5}
        >
          <ReactjiPicker onClick={onClick} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default AddReactjiButton
