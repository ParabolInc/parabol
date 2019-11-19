import {useCallback, useEffect, useRef} from 'react'
import useHotkey from './useHotkey'
import handleHotkey from '../utils/meetings/handleHotkey'
import useGotoStageId from './useGotoStageId'
import useGotoPrev from './useGotoPrev'

const useGotoPrevHotkey = (meetingRef: any, gotoStageId: ReturnType<typeof useGotoStageId>) => {
  const gotoPrev = useGotoPrev(meetingRef, gotoStageId)
  const latestHandler = useRef<typeof gotoPrev>()
  useEffect(() => {
    latestHandler.current = gotoPrev
  }, [gotoPrev])
  const cb = useCallback(
    handleHotkey(() => {
      latestHandler.current && latestHandler.current()
    }),
    []
  )
  useHotkey('left', cb)
}

export default useGotoPrevHotkey
