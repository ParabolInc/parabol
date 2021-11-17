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
  const sortedFrequentlyUsed = Object.entries(frequentlyUsed) as [string, number][]
  sortedFrequentlyUsed.sort((a, b) => b[1] - a[1])

  return Object.keys(sortedFrequentlyUsed)
    .map((emoji) => sortedFrequentlyUsed[emoji][0])
    .slice(0, 18)
}

export {updateUsage, getRecentArray}
