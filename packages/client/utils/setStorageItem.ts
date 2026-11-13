// A browser throws when the site's storage is full or the user blocks it,
// and nothing the app keeps there is worth failing for
const setStorageItem = (storage: 'localStorage' | 'sessionStorage', key: string, value: string) => {
  try {
    window[storage].setItem(key, value)
  } catch (error) {
    console.warn(`Could not save ${key} to ${storage}`, error)
  }
}

export default setStorageItem
