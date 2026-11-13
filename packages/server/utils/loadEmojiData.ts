import type {EmojiMartData} from '@emoji-mart/data'

// the emoji data is megabytes of heap once parsed, so the first reactji or Confluence export parses it instead of every server's startup
const loadEmojiData = () => require('@emoji-mart/data') as EmojiMartData

export default loadEmojiData
