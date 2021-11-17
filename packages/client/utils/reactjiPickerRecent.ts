const DEFAULT_ORDER = {
  heart: 0,
  tada: 0,
  smile: 0,
  rocket: 0,
  fire: 0,
  white_check_mark: 0,
  confused: 0,
  cry: 0,
  x: 0
}

const RECENT_REACTJI_PICKER = 'recentReactjiPicker'

const getRecent = () => {
  const localStorageRecent = localStorage.getItem(RECENT_REACTJI_PICKER)
  return localStorageRecent === null ? DEFAULT_ORDER : JSON.parse(localStorageRecent)
}

const updateUsage = (emojiId: string) => {
  const frequentlyUsed = getRecent()
  frequentlyUsed[emojiId] || (frequentlyUsed[emojiId] = 0)
  frequentlyUsed[emojiId] += 1
  localStorage.setItem(RECENT_REACTJI_PICKER, JSON.stringify(frequentlyUsed))
}

const getRecentArray = () => {
  const frequentlyUsed = getRecent()

  const sortedFrequentlyUsed: [string, number][] = []
  for (const emoji in frequentlyUsed) sortedFrequentlyUsed.push([emoji, frequentlyUsed[emoji]])
  sortedFrequentlyUsed.sort((a, b) => a[1] - b[1]).reverse()

  const sortedFrequentlyUsedKeys: string[] = []
  for (const emoji of sortedFrequentlyUsed) sortedFrequentlyUsedKeys.push(emoji[0])

  return sortedFrequentlyUsedKeys
}

export {updateUsage, getRecentArray}
