import {RefObject, useLayoutEffect, useState} from 'react'
import {ElementHeight} from '../types/constEnums'
import {MeetingsDash_viewer} from '../__generated__/MeetingsDash_viewer.graphql'

type Meetings = MeetingsDash_viewer['teams'][0]['activeMeetings']
type Card = {
  cardIdx: number
  infoHeight: number
}
type TopByRow = {
  [row: number]: {
    isShowingAvatars: boolean
    top: number
    maxInfoHeight: number
    cards: Card[]
  }
}

const getRowMaxHeight = (
  refs: RefObject<HTMLDivElement>[],
  rowIdx: number,
  cardsPerRow: number
) => {
  const startIdx = cardsPerRow * rowIdx
  const endIdx = Math.min(startIdx + cardsPerRow, refs.length)
  const finalRowEls = refs.slice(startIdx, endIdx).map((finalRowRef) => finalRowRef.current)

  const finalRowHeights = finalRowEls
    .map((el) => el?.clientHeight)
    .filter((height): height is number => !!height)
  const maxInfoHeight = Math.max(...finalRowHeights)
  return maxInfoHeight
}

const getTopForARow = (rowIdx: number, topByRow: TopByRow) => {
  if (rowIdx === 0) return 0
  const prevTop = topByRow[rowIdx - 1].top
  const prevMaxInfoHeight = topByRow[rowIdx - 1].maxInfoHeight
  const prevMaxCardHeight =
    prevMaxInfoHeight + ElementHeight.MEETING_CARD_IMG + ElementHeight.MEETING_CARD_MARGIN
  const newTop = prevTop + prevMaxCardHeight
  return newTop
}

const useTopPerRow = (
  cardsPerRow: number | null,
  meetings: Meetings,
  cardInfoRefs: RefObject<HTMLDivElement>[]
) => {
  const [topByRow, setTopByRow] = useState<TopByRow>({})
  const [dashHeight, setDashHeight] = useState(0)
  const totalRows = !meetings.length || !cardsPerRow ? 0 : Math.ceil(meetings.length / cardsPerRow)

  const getTopByRow = () => {
    if (!cardsPerRow) return
    const topByRow: TopByRow = {}
    // init topByRow
    for (let meetingIdx = 0; meetingIdx < meetings.length; meetingIdx++) {
      const rowIdx = cardsPerRow === 0 ? 0 : Math.floor(meetingIdx / cardsPerRow)
      const cardsInRow = topByRow[rowIdx]?.cards
      const newCard = {cardIdx: meetingIdx, infoHeight: 0}
      const newCards = cardsInRow ? [...cardsInRow, newCard] : [newCard]
      topByRow[rowIdx] = {
        isShowingAvatars: false,
        top: ElementHeight.MEETING_CARD_MARGIN,
        maxInfoHeight: 0,
        cards: newCards
      }
    }

    const adjustTop = (meetingIdx: number, meetingInfoHeight: number) => {
      const rowIdx = cardsPerRow === 0 ? 0 : Math.floor(meetingIdx / cardsPerRow)
      const cardsInRow = topByRow[rowIdx].cards
      const newCards = cardsInRow.map((cardInRow) => {
        if (cardInRow.cardIdx === meetingIdx) {
          return {
            cardIdx: meetingIdx,
            infoHeight: meetingInfoHeight
          }
        }
        return cardInRow
      })
      topByRow[rowIdx].cards = newCards
      const infoHeights = topByRow[rowIdx].cards.map((card) => card.infoHeight)
      const newMaxInfoHeight = Math.max(...infoHeights)
      topByRow[rowIdx].maxInfoHeight = newMaxInfoHeight
      if (rowIdx === 0) return
      for (let i = rowIdx; i < totalRows; i++) {
        // const prevTop = topByRow[rowIdx - 1].top
        // const prevMaxInfoHeight = topByRow[rowIdx - 1].maxInfoHeight
        // const prevMaxCardHeight =
        //   prevMaxInfoHeight + ElementHeight.MEETING_CARD_IMG + ElementHeight.MEETING_CARD_MARGIN
        // const newTop = prevTop + prevMaxCardHeight
        const newTop = getTopForARow(rowIdx, topByRow)
        topByRow[i].top = newTop
      }
    }

    meetings.forEach((meeting, meetingIdx) => {
      const {id: meetingId, meetingMembers} = meeting
      const connectedUsers = meetingMembers.filter(({user}) => {
        return user.lastSeenAtURLs?.includes(`/meet/${meetingId}`) && user.isConnected
      })
      const cardInfoRef = cardInfoRefs[meetingIdx]
      const el = cardInfoRef.current
      if (!el) return
      const {clientHeight} = el
      if (!clientHeight) return
      const rowIdx = cardsPerRow === 0 ? 0 : Math.floor(meetingIdx / cardsPerRow)
      const avatarListEl = el.children[el.children.length - 1] // hackily get the avatarList el
      const avatarListHeight = avatarListEl.clientHeight
      if (topByRow[rowIdx]) {
        // avatar list can update after grabbing cardInfoRef height
        const heightDiff =
          connectedUsers.length && avatarListHeight === 0
            ? +ElementHeight.MEETING_CARD_AVATARS
            : connectedUsers.length === 0 && avatarListHeight === ElementHeight.MEETING_CARD_AVATARS
            ? -ElementHeight.MEETING_CARD_AVATARS
            : 0
        const meetingInfoHeight = clientHeight + heightDiff
        adjustTop(meetingIdx, meetingInfoHeight)
      }
    })
    // const finalRowCount = cardsPerRow ? meetings.length % cardsPerRow : 0
    const finalRowIdx = Math.floor(cardInfoRefs.length / cardsPerRow)
    // const dashHeight = getTopForARow(finalRowIdx + 1, topByRow)
    setDashHeight(dashHeight)
    // const finalRowEls = cardInfoRefs
    //   .slice(cardInfoRefs.length - finalRowCount, cardInfoRefs.length)
    //   .map((finalRowRef) => finalRowRef.current)

    // const finalRowHeights = finalRowEls
    //   .map((el) => el?.clientHeight)
    //   .filter((height): height is number => !!height)
    // const maxInfoHeight = Math.max(...finalRowHeights)

    setTopByRow(topByRow)
  }

  const meetingMembers = meetings.map((meeting) => meeting.meetingMembers)

  useLayoutEffect(() => {
    if (meetings.length) {
      getTopByRow()
    }
  }, [cardsPerRow, meetings])

  return {topByRow, dashHeight}
}

export default useTopPerRow
