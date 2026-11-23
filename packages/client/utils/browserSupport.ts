export const UPDATE_BROWSER_URL = 'https://browser-update.org/update-browser.html'

// The client ships without polyfills, so the newest built-ins it calls decide which browsers can run it
export const isBrowserTooOld = !('toSorted' in Array.prototype) || !('Segmenter' in Intl)
