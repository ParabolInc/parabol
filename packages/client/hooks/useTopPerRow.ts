import {RefObject, useLayoutEffect, useState} from 'react'
import {ElementHeight} from '../types/constEnums'
import {MeetingsDash_viewer} from '../__generated__/MeetingsDash_viewer.graphql'

type Meetings = MeetingsDash_viewer['teams'][0]['activeMeetings']
type TopByRow = {
  [row: number]: {
    isShowingAvatars: boolean
    top: number
  }
}

const useTopPerRow = (
  cardsPerRow: number | null,
  meetings: Meetings,
  refs: RefObject<HTMLDivElement>[]
) => {
  const [topByRow, setTopByRow] = useState<TopByRow>({})
  const totalRows = !meetings.length || !cardsPerRow ? 0 : Math.ceil(meetings.length / cardsPerRow)

  const getTopByRow = () => {
    if (!meetings.length || !cardsPerRow) return
    const topByRow = {}
    for (let i = 0; i < totalRows; i++) {
      topByRow[i] = {
        isShowingAvatars: false,
        top: ElementHeight.MEETING_CARD_MARGIN
      }
    }
    const addTop = (rowIdx: number, meetingInfoHeight: number) => {
      if (!topByRow[rowIdx] || !meetingInfoHeight) return
      const topAboveRow = topByRow[rowIdx - 1].top
      for (let i = rowIdx; i < totalRows; i++) {
        const topForCard =
          meetingInfoHeight + ElementHeight.MEETING_CARD_IMG + ElementHeight.MEETING_CARD_MARGIN
        const newTop = topAboveRow + topForCard
        if (topByRow[i].top < newTop) {
          topByRow[i].top = newTop
        }
      }
    }

    meetings.forEach((meeting, meetingIdx) => {
      // const {id: meetingId, meetingMembers} = meeting
      // const connectedUsers = meetingMembers.filter(({user}) => {
      //   return user.lastSeenAtURLs?.includes(`/meet/${meetingId}`) && user.isConnected
      // })
      const meetingInfoRef = refs[meetingIdx]
      const el = meetingInfoRef.current
      if (!el) return
      const {clientHeight} = el
      if (!clientHeight) return
      const rowIdx = cardsPerRow === 0 ? 0 : Math.floor(meetingIdx / cardsPerRow)
      if (topByRow[rowIdx]) {
        addTop(rowIdx + 1, clientHeight)
      }
    })
    // const finalRowCount = cardsPerRow ? meetings.length % cardsPerRow : 0
    // const finalRowRefs = refs.slice(refs.length - finalRowCount, refs.length)
    // const finalRowHeights = finalRowRefs
    //   .map((ref) => ref.current?.clientHeight)
    //   .filter((height): height is number => !!height)
    // const maxHeight = Math.max(...finalRowHeights)
    // addTop(meetings.length, maxHeight) // get height of final row to calc meetingDash height
    // console.log('🚀 ~ ____meetings', {
    //   meetings,
    //   maxHeight,
    //   finalRowRefs,
    //   finalRowHeights,
    //   finalRowCount,
    //   len: refs.length
    // })

    setTopByRow(topByRow)
  }

  useLayoutEffect(() => {
    if (meetings.length) {
      getTopByRow()
    }
  }, [cardsPerRow, meetings])

  return topByRow
}

export default useTopPerRow
