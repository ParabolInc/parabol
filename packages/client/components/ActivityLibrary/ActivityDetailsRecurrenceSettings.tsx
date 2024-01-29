import React from 'react'
import {RecurrenceSettings} from '../TeamPrompt/Recurrence/RecurrenceSettings'
import NewMeetingDropdown from '../NewMeetingDropdown'
import {toHumanReadable} from '../TeamPrompt/Recurrence/HumanReadableRecurrenceRule'
import useModal from '../../hooks/useModal'
import DialogContainer from '../DialogContainer'

interface Props {
  onRecurrenceSettingsUpdated: (recurrenceSettings: RecurrenceSettings) => void
  recurrenceSettings: RecurrenceSettings
  placeholder: string
}

export const ActivityDetailsRecurrenceSettings = (props: Props) => {
  const {onRecurrenceSettingsUpdated, recurrenceSettings, placeholder} = props
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
            placeholder={placeholder}
          />
        </DialogContainer>
      )}
    </>
  )
}
