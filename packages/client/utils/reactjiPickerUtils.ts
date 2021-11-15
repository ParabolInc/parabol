const DEFAULT = {
  heart: 9,
  tada: 8,
  smile: 7,
  rocket: 6,
  fire: 5,
  white_check_mark: 4,
  confused: 3,
  cry: 2,
  x: 1
}

const getRecent = () => {
  const localStorageRecent = localStorage.getItem('recent')
  return localStorageRecent === null ? DEFAULT : JSON.parse(localStorageRecent)
}

const handleRecent = (emoji) => {
  const frequentlyUsed = getRecent()
  const {id} = emoji
  frequentlyUsed[id] || (frequentlyUsed[id] = 0)
  frequentlyUsed[id] += 1
  localStorage.setItem('recent', JSON.stringify(frequentlyUsed))
}

const getRecentArray = () => Object.keys(getRecent())

export {handleRecent, getRecentArray}
