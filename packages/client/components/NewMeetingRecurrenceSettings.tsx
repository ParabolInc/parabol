import React, {ChangeEvent} from 'react'
import {RRule} from 'rrule'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalStatus} from '../hooks/usePortal'
import NewMeetingDropdown from './NewMeetingDropdown'
import {toHumanReadable} from './Recurrence/HumanReadableRecurrenceRule'
import {RecurrenceSettings} from './Recurrence/RecurrenceSettings'

interface Props {
  onRecurrenceSettingsUpdated: (recurrenceSettings: RecurrenceSettings) => void
  recurrenceSettings: RecurrenceSettings
  placeholder: string
}

export const NewMeetingRecurrenceSettings = (props: Props) => {
  const {onRecurrenceSettingsUpdated, recurrenceSettings, placeholder} = props
  const {rrule, name} = recurrenceSettings

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value || placeholder
    onRecurrenceSettingsUpdated({...recurrenceSettings, name: title})
  }

  const onRruleChange = (rrule: RRule | null) => {
    onRecurrenceSettingsUpdated({...recurrenceSettings, rrule})
  }

  const {togglePortal, menuPortal, originRef, portalStatus} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      id: 'newMeetingRecurrenceSettings',
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
        <div className='flex flex-col'>
          <input
            className='form-input m-2 rounded border border-solid border-slate-500 p-2 font-sans text-base hover:border-slate-600 focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-600'
            type='text'
            name='title'
            placeholder={placeholder}
            value={name}
            onChange={onNameChange}
            min={1}
            max={50}
          />
          <RecurrenceSettings title={name} rrule={rrule} onRruleUpdated={onRruleChange} />
        </div>
      )}
    </>
  )
}
