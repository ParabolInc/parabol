import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

interface Props {
  onClick: (emoji: string) => void
}

const ReactjiPicker = (props: Props) => {
  const {onClick} = props
  const onEmojiSelect = (emoji: data.Emoji) => {
    onClick(emoji.id)
  }
  return (
    <Picker
      data={data}
      onEmojiSelect={onEmojiSelect}
      theme='light'
      skinTonePosition='none'
      previewPosition='none'
      autoFocus
    />
  )
}

export default ReactjiPicker
