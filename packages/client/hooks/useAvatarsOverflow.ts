import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'
import {dashAvatarWidth} from '../components/DashboardAvatars/DashboardAvatar'

const useAvatarsOverflow = (avatarsRef: RefObject<HTMLDivElement>) => {
  const [maxAvatars, setMaxAvatars] = useState(0)
  const margin = 16
  const checkOverflow = () => {
    const {current: el} = avatarsRef
    if (!el) return
    const {clientWidth: totalWidth} = el
    const maxAvatars = Math.floor(totalWidth / (dashAvatarWidth + margin))
    setMaxAvatars(maxAvatars)
  }
  useLayoutEffect(checkOverflow, [])
  useResizeObserver(checkOverflow, avatarsRef)
  return maxAvatars
}

export default useAvatarsOverflow
