import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import * as Popover from '@radix-ui/react-popover'
import React from 'react'

interface Props {
  onClick: (emoji: string) => void
}

const ReactjiPicker = (props: Props) => {
  const {onClick} = props
  return (
    <Popover.Root>
      <Picker data={data} onEmojiSelect={onClick} theme='light' skinTonePosition='none' />
    </Popover.Root>
  )
}

export default ReactjiPicker
