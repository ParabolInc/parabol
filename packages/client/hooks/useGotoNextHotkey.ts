import {useCallback, useEffect, useRef} from 'react'
import useHotkey from './useHotkey'
import handleHotkey from '../utils/meetings/handleHotkey'
import useGotoNext from './useGotoNext'

export const useGotoNextHotkey = (gotoNext: ReturnType<typeof useGotoNext>['gotoNext']) => {
  const latestHandler = useRef<typeof gotoNext>()
  useEffect(() => {
    latestHandler.current = gotoNext
  }, [gotoNext])

  const cb = useCallback(
    handleHotkey(() => {
      latestHandler.current && latestHandler.current({isHotkey: true})
    }),
    []
  )
  useHotkey('right', cb)
}

export default useGotoNextHotkey
