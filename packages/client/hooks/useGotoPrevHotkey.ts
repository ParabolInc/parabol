import {useCallback, useEffect, useRef} from 'react'
import handleHotkey from '../utils/meetings/handleHotkey'
import useGotoPrev from './useGotoPrev'
import useGotoStageId from './useGotoStageId'
import useHotkey from './useHotkey'

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
