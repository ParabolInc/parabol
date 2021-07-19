import {RefObject, useLayoutEffect} from 'react'
import {commitLocalUpdate} from 'react-relay'
import useAtmosphere from './useAtmosphere'
import useResizeObserver from './useResizeObserver'

// need meeting top height to calc spotlight modal height
// store in relay to avoid prop drilling
const useRetroGroupTopBar = (topBarRef: RefObject<HTMLDivElement>, meetingId: string) => {
  const atmosphere = useAtmosphere()

  const updateHeight = () => {
    if (!topBarRef.current) return
    const {clientHeight} = topBarRef.current
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      const topBarHeight = meeting.getValue('topBarHeight')
      if (topBarHeight !== clientHeight) {
        meeting.setValue(clientHeight, 'topBarHeight')
      }
    })
  }
  useLayoutEffect(updateHeight, [])
  useResizeObserver(updateHeight, topBarRef)
}

export default useRetroGroupTopBar
