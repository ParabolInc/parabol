import {useEffect, useRef} from 'react'
import BugController, {SpiderController} from '../utils/screenBugs/BugController'

const useScreenBugs = (isBuggy: boolean, meetingId: string) => {
  const bugRef = useRef<BugController>()
  const spiderRef = useRef<SpiderController>()
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (!isBuggy) return
    const showBugs = new Date() < new Date('2021-Apr-30') || meetingId.charCodeAt(0) % 2 === 0
    if (!showBugs) return
    clearTimeout(cleanupTimerRef.current)
    bugRef.current = new BugController({
      minBugs: 5,
      maxBugs: 8,
      mouseOver: 'flyoff',
      minDelay: 2000
    })
    spiderRef.current = new SpiderController({
      minBugs: 3,
      maxBugs: 4,
      mouseOver: 'die',
      minDelay: 2000
    })
    return () => {
      const bug = bugRef.current
      const spider = spiderRef.current
      bug?.killAll()
      spider?.killAll()
      cleanupTimerRef.current = setTimeout(() => {
        bug?.end()
        spider?.end()
      }, 2000)
    }
  }, [isBuggy])
}

export default useScreenBugs
