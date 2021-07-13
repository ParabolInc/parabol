import {useLayoutEffect, useState} from 'react'
import {MeetingsDash_viewer} from '../__generated__/MeetingsDash_viewer.graphql'

type Meetings = MeetingsDash_viewer['teams'][0]['activeMeetings']
type TopByRow = {
  [row: number]: {
    isShowingAvatars: boolean
    top: number
  }
}

const useTopPerRow = (cardsPerRow: number | null, meetings: Meetings) => {
  const [topByRow, setTopByRow] = useState<TopByRow>({})
  const totalRows = !meetings.length || !cardsPerRow ? 0 : Math.ceil(meetings.length / cardsPerRow)
  const getTopByRow = () => {
    if (!meetings.length || !cardsPerRow) return
    const topByRow = {}
    for (let i = 0; i < totalRows; i++) {
      topByRow[i] = {
        isShowingAvatars: false,
        top: 0
      }
    }
    const addTop = (rowIdx: number) => {
      if (!topByRow[rowIdx]) return
      for (let i = rowIdx; i < totalRows; i++) {
        topByRow[i].top += 32
      }
    }
    meetings.forEach((meeting, meetingIdx) => {
      const {id: meetingId, meetingMembers} = meeting
      const connectedUsers = meetingMembers.filter(({user}) => {
        return user.lastSeenAtURLs?.includes(`/meet/${meetingId}`) && user.isConnected
      })
      if (connectedUsers && connectedUsers.length) {
        const rowIdx = cardsPerRow === 0 ? 0 : Math.floor(meetingIdx / cardsPerRow)
        if (topByRow[rowIdx]?.isShowingAvatars === false) {
          topByRow[rowIdx].isShowingAvatars = true
          addTop(rowIdx + 1)
        }
      }
    })
    setTopByRow(topByRow)
  }

  useLayoutEffect(() => {
    getTopByRow()
  }, [cardsPerRow, meetings])

  return topByRow
}

export default useTopPerRow
