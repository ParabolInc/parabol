import {useEffect, useRef, useState} from 'react'

/**
 * Debounces a search string. It will wait for the user to stop typing or finishing a word before returning the debounced search string.
 */
export const useDebouncedSearch = (search: string, delayMs = 500) => {
  const wordEndChars = /[\s,.!?:;\-()[\]{}<>"'\\|&*+=#%@$]/
  const timer = useRef<NodeJS.Timeout>(undefined)
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    if (!search) {
      setDebouncedSearch(search)
      return
    }
    // if they finished a word, send it now
    if (wordEndChars.test(search.at(-1)!)) {
      setDebouncedSearch(search)
      return
    }
    // assuming 40 wpm with 5 characters per word we get 300ms between characters
    // give some wiggle room for slow typers
    timer.current = setTimeout(() => {
      setDebouncedSearch(search)
      timer.current = undefined
    }, delayMs)
    return () => {
      clearTimeout(timer.current)
      timer.current = undefined
    }
  }, [search, delayMs])

  return {
    debouncedSearch,
    dirty: !!timer.current
  }
}
