import clsx from 'clsx'
import dayjs from 'dayjs'
import utcPlugin from 'dayjs/plugin/utc'
import React, {ChangeEvent, useEffect} from 'react'
import {RecurrenceSettings} from './Recurrence/RecurrenceSettings'
import * as Collapsible from '@radix-ui/react-collapsible'
import {Add, Close} from '@mui/icons-material'
import PrimaryButton from './PrimaryButton'
import {DialogActions} from '../ui/Dialog/DialogActions'
import SecondaryButton from './SecondaryButton'

dayjs.extend(utcPlugin)

interface Props {
  onRecurrenceSettingsUpdated: (
    recurrenceSettings: RecurrenceSettings,
    validationErrors: string[] | undefined
  ) => void
  recurrenceSettings: RecurrenceSettings
  placeholder: string
}

export const ScheduleDialog = (props: Props) => {
  const {onRecurrenceSettingsUpdated, recurrenceSettings, placeholder} = props
  const [open, setOpen] = React.useState(!!recurrenceSettings.rrule)
  const [meetingSeriesName, setMeetingSeriesName] = React.useState(recurrenceSettings.name)

  const isRecurring = !!recurrenceSettings.rrule

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMeetingSeriesName(event.target.value)
  }

  useEffect(() => {
    if (recurrenceSettings.name !== meetingSeriesName) {
      onRecurrenceSettingsUpdated({name: meetingSeriesName, rrule: recurrenceSettings.rrule}, undefined)
    }
  }, [meetingSeriesName, recurrenceSettings])


  const onOpenChange = (open: boolean) => {
    if (!open) {
      onRecurrenceSettingsUpdated({name: recurrenceSettings.name, rrule: null}, undefined)
    }
    setOpen(open)
  }

  const handleCancel = () => {
  }
  const handleSubmit = () => {
  }

  return (
    <div className='space-y-4 p-4'>
      <div className='text-lg font-semibold leading-none'>Schedule Your Meeting</div>
      <div className='text-sm text-slate-800'>
        Create a recurring meeting series or add the meeting to your calendar.
      </div>
      <div className='flex flex-col'>
        <input
          className='focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 form-input text-base font-sans p-2 border border-solid border-slate-500 rounded hover:border-slate-600'
          type='text'
          placeholder='Enter the name for your meeting'
          value={meetingSeriesName}
          onChange={onNameChange}
          min={1}
          max={50}
        />
      </div>
      <SecondaryButton>Connect to Google Calendar</SecondaryButton>
      <Collapsible.Root className='flex flex-col border rounded border-slate-500' open={open} onOpenChange={onOpenChange}>
        <Collapsible.Trigger className='flex items-center justify-between cursor-pointer bg-transparent p-2'>
          <div className='text-lg font-semibold leading-none'>Recurrence</div>
          {open ? <Close /> : <Add />}
        </Collapsible.Trigger>
        <Collapsible.Content className='space-y-4'>
          <RecurrenceSettings {...props} />
        </Collapsible.Content>
      </Collapsible.Root>
      <DialogActions>
        <SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
        <PrimaryButton size='medium' onClick={handleSubmit}>
          {`Create Meeting`}
        </PrimaryButton>
      </DialogActions>
    </div>
  )
}
