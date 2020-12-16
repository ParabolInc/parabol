import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from '~/types/graphql'
import {RefObject, useEffect,  useState} from 'react'
import {DiscussionThreadEnum, NavSidebar} from '~/types/constEnums'
import useResizeObserver from './useResizeObserver'

const useControlBarLeft = (
  meetingType: string,
  phaseType: string,
  showSidebar: boolean,
  ref: RefObject<HTMLDivElement>
): number => {
  const [left, setLeft] = useState(0)

  const calculateLeft = () => {
    if (!ref || !ref.current) return
    const innerWidth = window.innerWidth
    const bbox = ref.current.getBoundingClientRect()
    const {width} = bbox
    const isRightDrawerOpen =
    meetingType === MeetingTypeEnum.poker && phaseType === NewMeetingPhaseTypeEnum.ESTIMATE
    if (showSidebar && !isRightDrawerOpen) {
      const newLeft = NavSidebar.WIDTH + (innerWidth - NavSidebar.WIDTH) / 2 - width / 2
      setLeft(newLeft)
    } else if (showSidebar && isRightDrawerOpen)
      setLeft(NavSidebar.WIDTH + DiscussionThreadEnum.WIDTH)
    else {
      //
    }
  }

  useResizeObserver(() => calculateLeft(), ref)
  useEffect(() => {
    calculateLeft()
  }, [meetingType, phaseType, showSidebar, ref])

  return left
}

export default useControlBarLeft
