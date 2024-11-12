import {Suspense} from 'react'
import meetingCardOptionsMenuQuery, {
  MeetingCardOptionsMenuQuery
} from '../__generated__/MeetingCardOptionsMenuQuery.graphql'
import {MenuProps} from '../hooks/useMenu'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import MeetingCardOptionsMenu from './MeetingCardOptionsMenu'

interface Props {
  meetingId: string
  teamId: string
  menuProps: MenuProps
  popTooltip: () => void
  openRecurrenceSettingsModal: () => void
  openEndRecurringMeetingModal: () => void
}

const MeetingCardOptionsMenuRoot = (props: Props) => {
  const {
    meetingId,
    teamId,
    menuProps,
    popTooltip,
    openRecurrenceSettingsModal,
    openEndRecurringMeetingModal
  } = props
  const queryRef = useQueryLoaderNow<MeetingCardOptionsMenuQuery>(meetingCardOptionsMenuQuery, {
    meetingId,
    teamId
  })
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <MeetingCardOptionsMenu
          queryRef={queryRef}
          menuProps={menuProps}
          popTooltip={popTooltip}
          openRecurrenceSettingsModal={openRecurrenceSettingsModal}
          openEndRecurringMeetingModal={openEndRecurringMeetingModal}
        />
      )}
    </Suspense>
  )
}

export default MeetingCardOptionsMenuRoot
