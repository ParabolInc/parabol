import React from 'react'
import {RecurrenceSettings} from '../TeamPrompt/Recurrence/RecurrenceSettings'
import NewMeetingDropdown from '../NewMeetingDropdown'
import {toHumanReadable} from '../TeamPrompt/Recurrence/HumanReadableRecurrenceRule'
import DialogContainer from '../DialogContainer'
import {Dialog, DialogContent, DialogTrigger} from '../RadixDialog'

interface Props {
  onRecurrenceSettingsUpdated: (recurrenceSettings: RecurrenceSettings) => void
  recurrenceSettings: RecurrenceSettings
}

export const ActivityDetailsRecurrenceSettings = (props: Props) => {
  const {onRecurrenceSettingsUpdated, recurrenceSettings} = props
  // const {togglePortal, modalPortal} = useModal({
  //   id: 'activityDetailsRecurrenceSettings'
  // })

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <NewMeetingDropdown
            label={
              recurrenceSettings.rrule
                ? toHumanReadable(recurrenceSettings.rrule, {
                    useShortNames: true,
                    shortDayNameAfter: 1
                  })
                : 'Does not restart'
            }
            title={'Recurrence'}
            onClick={() => {
              console.log('click')
            }}
          />
        </DialogTrigger>
        <DialogContent className='fixed'>
          <DialogContainer className='bg-white'>
            <RecurrenceSettings
              onRecurrenceSettingsUpdated={onRecurrenceSettingsUpdated}
              recurrenceSettings={recurrenceSettings}
            />
          </DialogContainer>
        </DialogContent>
      </Dialog>
    </>
  )
}
