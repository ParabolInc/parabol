import {useLayoutEffect, useState} from 'react'

const useTopPerRow = (cardsPerRow: number, meetings: any, viewerId?: string) => {
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
    if (!viewerId) return {}
    meetings.forEach((meeting, meetingIdx) => {
      const {id: meetingId, meetingMembers} = meeting.child
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
    return topByRow
  }

  useLayoutEffect(() => {
    const newTopByRow = getTopByRow()
    setTopByRow(newTopByRow)
  }, [cardsPerRow, meetings])

  return topByRow
}

export default useTopPerRow
