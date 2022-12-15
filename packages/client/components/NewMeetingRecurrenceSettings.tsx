import React from 'react'
import {RRule} from 'rrule'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalStatus} from '../hooks/usePortal'
import NewMeetingDropdown from './NewMeetingDropdown'
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
        label={recurrenceRule ? recurrenceRule.toText() : 'Does not repeat'}
        title={'Recurrence'}
        onClick={handleClick}
        opened={[PortalStatus.Entering, PortalStatus.Entered].includes(portalStatus)}
        ref={originRef}
      />
      {menuPortal(
        <RecurrenceSettings
          onRecurrenceRuleUpdated={onRecurrenceRuleUpdated}
          recurrenceRule={recurrenceRule}
        />
      )}
    </>
  )
}
