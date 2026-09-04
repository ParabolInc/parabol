import {Suspense} from 'react'
import meetingCardOptionsMenuQuery, {
  type MeetingCardOptionsMenuQuery
} from '../__generated__/MeetingCardOptionsMenuQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import MeetingCardOptionsMenu from './MeetingCardOptionsMenu'

interface Props {
  meetingId: string
  teamId: string
  popTooltip: () => void
  openRecurrenceSettingsModal: () => void
  openEndRecurringMeetingModal: () => void
}

const MeetingCardOptionsMenuRoot = (props: Props) => {
  const {meetingId, teamId, popTooltip, openRecurrenceSettingsModal, openEndRecurringMeetingModal} =
    props
  const queryRef = useQueryLoaderNow<MeetingCardOptionsMenuQuery>(meetingCardOptionsMenuQuery, {
    meetingId,
    teamId
  })
  return (
    <Suspense fallback={<div className='h-7 min-w-[200px]' />}>
      {queryRef && (
        <MeetingCardOptionsMenu
          queryRef={queryRef}
          popTooltip={popTooltip}
          openRecurrenceSettingsModal={openRecurrenceSettingsModal}
          openEndRecurringMeetingModal={openEndRecurringMeetingModal}
        />
      )}
    </Suspense>
  )
}

export default MeetingCardOptionsMenuRoot
