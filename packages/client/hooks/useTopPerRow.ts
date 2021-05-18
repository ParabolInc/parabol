import {useLayoutEffect, useState} from 'react'
import {MeetingsDash_viewer} from '../__generated__/MeetingsDash_viewer.graphql'

type Meetings = MeetingsDash_viewer['teams'][0]['activeMeetings']

const useTopPerRow = (cardsPerRow: number, meetings: Meetings, viewerId?: string) => {
  const [topByRow, setTopByRow] = useState({})
  const totalRows = !meetings.length || !cardsPerRow ? 0 : Math.ceil(meetings.length / cardsPerRow)

  const getTopByRow = () => {
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
    if (!viewerId) return
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
