import React from 'react'
import {RecurrenceSettings} from '../TeamPrompt/Recurrence/RecurrenceSettings'
import NewMeetingDropdown from '../NewMeetingDropdown'
import {toHumanReadable} from '../TeamPrompt/Recurrence/HumanReadableRecurrenceRule'
import useModal from '../../hooks/useModal'
import DialogContainer from '../DialogContainer'

interface Props {
  onRecurrenceSettingsUpdated: (recurrenceSettings: RecurrenceSettings) => void
  recurrenceSettings: RecurrenceSettings
}

export const ActivityDetailsRecurrenceSettings = (props: Props) => {
  const {onRecurrenceSettingsUpdated, recurrenceSettings} = props
  const {togglePortal, modalPortal} = useModal({
    id: 'activityDetailsRecurrenceSettings'
  })

  return (
    <>
      <NewMeetingDropdown
        label={
          recurrenceSettings.rrule
            ? toHumanReadable(recurrenceSettings.rrule, {useShortNames: true, shortDayNameAfter: 1})
            : 'Does not restart'
        }
        title={'Recurrence'}
        onClick={togglePortal}
      />
      {modalPortal(
        <DialogContainer className='bg-white'>
          <RecurrenceSettings
            onRecurrenceSettingsUpdated={onRecurrenceSettingsUpdated}
            recurrenceSettings={recurrenceSettings}
          />
        </DialogContainer>
      )}
    </>
  )
}
