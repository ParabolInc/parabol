// must occur at parent of botm elements otherwise the DOM may not be ready
import {RefObject, useEffect} from 'react'
import collectControlBarCoverables, {CoverableState} from 'utils/collectControlBarCoverables'
import {MeetingControlBarEnum} from 'types/constEnums'

const onDrag = (coverableState: CoverableState, left: number, right: number) => {
  const coverables = collectControlBarCoverables(coverableState)
  for (let i = 0; i < coverables.length; i++) {
    const coverable = coverables[i]
    const willBeExpanded = coverable.left > right || coverable.right < left ? false : true
    if (coverable.isExpanded !== willBeExpanded) {
      const height = willBeExpanded ? `calc(100% - ${MeetingControlBarEnum.HEIGHT}px)` : '100%'
      coverable.el.style.height = height
      coverable.isExpanded = willBeExpanded
    }
  }
}

const useInitControlBarCoverables = (meetingControlBarRef: RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const bbox = meetingControlBarRef.current?.getBoundingClientRect()
    if (!bbox) return
    onDrag('load', bbox?.left, bbox?.right)
  }, [])
}

export default useInitControlBarCoverables
