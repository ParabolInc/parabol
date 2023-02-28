import React from 'react'
import {RRule} from 'rrule'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalStatus} from '../hooks/usePortal'
import NewMeetingDropdown from './NewMeetingDropdown'
import {toHumanReadable} from './TeamPrompt/Recurrence/HumanReadableRecurrenceRule'
import {RecurrenceSettings} from './TeamPrompt/Recurrence/RecurrenceSettings'

interface Props {
  onRecurrenceRuleUpdated: (rrule: RRule | null) => void
  recurrenceRule: RRule | null
}

export const NewMeetingRecurrenceSettings = (props: Props) => {
  const {onRecurrenceRuleUpdated, recurrenceRule} = props
  const {togglePortal, menuPortal, originRef, portalStatus} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      id: 'newMeetingRecurrenceSettings',
      parentId: 'newMeetingRoot',
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
          recurrenceRule
            ? toHumanReadable(recurrenceRule, {useShortNames: true, shortDayNameAfter: 1})
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
          onRecurrenceRuleUpdated={onRecurrenceRuleUpdated}
          recurrenceRule={recurrenceRule}
        />
      )}
    </>
  )
}
