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
  const theme = document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light'
  return (
    <Picker
      data={data}
      onEmojiSelect={onEmojiSelect}
      theme={theme}
      skinTonePosition='none'
      previewPosition='none'
      autoFocus
    />
  )
}

export default ReactjiPicker
