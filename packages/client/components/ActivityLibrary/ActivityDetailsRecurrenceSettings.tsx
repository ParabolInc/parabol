import React from 'react'
import {PortalId} from '../../hooks/usePortal'
import {RecurrenceSettings} from '../TeamPrompt/Recurrence/RecurrenceSettings'
import NewMeetingDropdown from '../NewMeetingDropdown'
import {toHumanReadable} from '../TeamPrompt/Recurrence/HumanReadableRecurrenceRule'
import useModal from '../../hooks/useModal'
import DialogContainer from '../DialogContainer'

interface Props {
  onRecurrenceSettingsUpdated: (recurrenceSettings: RecurrenceSettings) => void
  recurrenceSettings: RecurrenceSettings
  parentId?: PortalId
}

export const ActivityDetailsRecurrenceSettings = (props: Props) => {
  const {onRecurrenceSettingsUpdated, recurrenceSettings, parentId} = props
  const {togglePortal, modalPortal} = useModal({
    id: 'activityDetailsRecurrenceSettings',
    parentId: parentId
  })
  const handleClick = () => {
    togglePortal()
  }

  return (
    <>
      <NewMeetingDropdown
        label={
          recurrenceSettings.rrule
            ? toHumanReadable(recurrenceSettings.rrule, {useShortNames: true, shortDayNameAfter: 1})
            : 'Does not restart'
        }
        title={'Recurrence'}
        onClick={handleClick}
      />
      {modalPortal(
        <DialogContainer className='bg-white'>
          <RecurrenceSettings
            parentId='newMeetingRecurrenceSettings'
            onRecurrenceSettingsUpdated={onRecurrenceSettingsUpdated}
            recurrenceSettings={recurrenceSettings}
          />
        </DialogContainer>
      )}
    </>
  )
}
