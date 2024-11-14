import data from '@emoji-mart/data'

const getReactji = (emoji: string) => {
  const value = (data as data.EmojiMartData).emojis[emoji]!
  return {
    native: value.skins[0]?.native ?? '',
    reactjiName: value.name
  }
}

export default getReactji
