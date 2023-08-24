import appleEmojis from 'emoji-mart/data/apple.json'
import {uncompress} from 'emoji-mart/dist-modern/utils/data.js'
import {unifiedToNative} from 'emoji-mart/dist-modern/utils/index.js'

uncompress(appleEmojis)

const getReactji = (emoji: string) => {
  const value = appleEmojis.emojis[emoji as keyof typeof appleEmojis.emojis] as any
  return {
    unicode: unifiedToNative(value.unified) || '',
    shortName: value.short_names[0] ?? ''
  }
}

export default getReactji
