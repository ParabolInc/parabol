import React from 'react'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalId, PortalStatus} from '../hooks/usePortal'
import NewMeetingDropdown from './NewMeetingDropdown'
import {toHumanReadable} from './TeamPrompt/Recurrence/HumanReadableRecurrenceRule'
import {RecurrenceSettings} from './TeamPrompt/Recurrence/RecurrenceSettings'

interface Props {
  onRecurrenceSettingsUpdated: (recurrenceSettings: RecurrenceSettings) => void
  recurrenceSettings: RecurrenceSettings
  parentId?: PortalId
}

export const NewMeetingRecurrenceSettings = (props: Props) => {
  const {onRecurrenceSettingsUpdated, recurrenceSettings, parentId} = props
  const {togglePortal, menuPortal, originRef, portalStatus} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      id: 'newMeetingRecurrenceSettings',
      parentId: parentId,
      isDropdown: true
    }
  )
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
        opened={[PortalStatus.Entering, PortalStatus.Entered].includes(portalStatus)}
        ref={originRef}
      />
      {menuPortal(
        <RecurrenceSettings
          parentId='newMeetingRecurrenceSettings'
          onRecurrenceSettingsUpdated={onRecurrenceSettingsUpdated}
          recurrenceSettings={recurrenceSettings}
        />
      )}
    </>
  )
}
