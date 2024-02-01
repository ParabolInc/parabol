import React from 'react'
import {RecurrenceSettings} from '../Recurrence/RecurrenceSettings'
import {ScheduleDialog} from '../ScheduleDialog'
import NewMeetingDropdown from '../NewMeetingDropdown'
import {toHumanReadable} from '../Recurrence/HumanReadableRecurrenceRule'
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
          <ScheduleDialog
            onRecurrenceSettingsUpdated={onRecurrenceSettingsUpdated}
            recurrenceSettings={recurrenceSettings}
            placeholder={placeholder}
          />
        </DialogContainer>
      )}
    </>
  )
}
