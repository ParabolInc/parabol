import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject} from 'react'
import {createFragmentContainer} from 'react-relay'
import {MeetingsDash_viewer} from '~/__generated__/MeetingsDash_viewer.graphql'
import blueSquiggle from '../../../static/images/illustrations/blue-squiggle.svg'
import yellowFlashLine from '../../../static/images/illustrations/yellow-flash-line.svg'
import useBreakpoint from '../hooks/useBreakpoint'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useInitialRender from '../hooks/useInitialRender'
import useTransition, {TransitionStatus} from '../hooks/useTransition'
import {Layout} from '../types/constEnums'
// import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'
import MeetingCard from './MeetingCard'
import MeetingsDashEmpty from './MeetingsDashEmpty'
import useCardsPerRow from '../hooks/useCardsPerRow'
import useTopPerRow from '../hooks/useTopPerRow'
import useDeepEqual from '../hooks/useDeepEqual'
// import useMeetingMemberAvatars from '../hooks/useMeetingMemberAvatars'
// import {teamMembersByUserId} from 'parabol-server/dataloader/foreignLoaderMakers'

interface Props {
  meetingsDashRef: RefObject<HTMLDivElement>
  viewer: MeetingsDash_viewer | null
}

// const desktopDashWidestMediaQuery = makeMinWidthMediaQuery(Breakpoint.DASH_BREAKPOINT_WIDEST)

// const Wrapper = styled('div')({
//   height: '100%',
//   margin: '0 auto',
//   width: '100%',
//   [desktopDashWidestMediaQuery]: {
//     paddingLeft: NavSidebar.WIDTH,
//     paddingRight: RightSidebar.WIDTH
//   }
// })

// const InnerContainer = styled('div')<{maybeTabletPlus: boolean}>(({maybeTabletPlus}) => ({
//   display: 'flex',
//   margin: '0 auto auto',
//   maxWidth: Layout.TASK_COLUMNS_MAX_WIDTH,
//   padding: maybeTabletPlus ? '16px 0 0 16px' : '16px 16px 0',
//   width: '100%',
//   height: '100%'
// }))

const EmptyContainer = styled('div')({
  display: 'flex',
  flex: 1,
  height: '100%',
  margin: '0 auto',
  maxWidth: Layout.TASK_COLUMNS_MAX_WIDTH,
  padding: 16,
  position: 'relative'
})

const Squiggle = styled('img')({
  bottom: 80,
  display: 'block',
  position: 'absolute',
  right: 160
})

const Flash = styled('img')({
  bottom: 56,
  display: 'block',
  position: 'absolute',
  right: -32
})

const Spacer = styled('div')<{top: number}>(({top}) => ({
  position: 'absolute',
  top,
  width: 16,
  height: 32
}))

const MeetingsDash = (props: Props) => {
  const {meetingsDashRef, viewer} = props
  const teams = viewer?.teams ?? []
  const activeMeetings = teams
    .flatMap((team) => team.activeMeetings)
    .filter(Boolean)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
  const meetingsWithKey = activeMeetings.map((meeting, displayIdx) => ({
    ...meeting,
    key: meeting.createdAt,
    displayIdx
  }))
  const transitioningMeetings = useTransition(meetingsWithKey)
  const maybeBigDisplay = useBreakpoint(1900)
  const isInit = useInitialRender()
  const cardsPerRow = useCardsPerRow(meetingsDashRef)
  const memodMeetings = useDeepEqual(activeMeetings)
  const topByRow = useTopPerRow(cardsPerRow, memodMeetings, viewer?.id)
  const hasMeetings = activeMeetings.length > 0 && cardsPerRow
  const totalRows =
    !memodMeetings.length || !cardsPerRow ? 0 : Math.ceil(memodMeetings.length / cardsPerRow)
  useDocumentTitle('Meetings | Parabol', 'Meetings')
  if (!viewer) return null
  return (
    <>
      {hasMeetings ? (
        <>
          {transitioningMeetings.map((meeting, idx) => {
            const rowIdx = cardsPerRow === 0 ? 0 : Math.floor(idx / cardsPerRow)
            const topForAvatars = topByRow[rowIdx]?.top || 0
            const leftMargin = maybeBigDisplay ? 40 : 16
            return (
              <MeetingCard
                key={meeting.child.createdAt}
                left={336 * (idx % cardsPerRow) + leftMargin}
                top={272 * rowIdx + 16 + topForAvatars}
                meeting={meeting.child}
                onTransitionEnd={meeting.onTransitionEnd}
                status={isInit ? TransitionStatus.ENTERED : meeting.status}
              />
            )
          })}
          <Spacer top={272 * totalRows + 16} />
        </>
      ) : (
        <EmptyContainer>
          <MeetingsDashEmpty />
          {maybeBigDisplay ? (
            <>
              <Squiggle src={blueSquiggle} />
              <Flash src={yellowFlashLine} />
            </>
          ) : null}
        </EmptyContainer>
      )}
    </>
  )
}

graphql`
  fragment MeetingsDashActiveMeetings on Team {
    activeMeetings {
      ...MeetingCard_meeting
      ...useSnacksForNewMeetings_meetings
      id
      createdAt
      meetingMembers {
        user {
          isConnected
          lastSeenAtURLs
        }
      }
    }
  }
`

export default createFragmentContainer(MeetingsDash, {
  viewer: graphql`
    fragment MeetingsDash_viewer on User {
      id
      teams {
        ...MeetingsDashActiveMeetings @relay(mask: false)
      }
    }
  `
})
