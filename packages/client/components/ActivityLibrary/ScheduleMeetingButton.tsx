import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {RRule} from 'rrule'
import type {ScheduleMeetingButton_team$key} from '~/__generated__/ScheduleMeetingButton_team.graphql'
import type {CreateGcalEventInput} from '../../__generated__/StartRetrospectiveMutation.graphql'
import type {MenuMutationProps} from '../../hooks/useMutationProps'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogTrigger} from '../../ui/Dialog/DialogTrigger'
import {ScheduleDialog} from '../ScheduleDialog'
import SecondaryButton from '../SecondaryButton'

type Props = {
  mutationProps: MenuMutationProps
  handleStartActivity: (name?: string, rrule?: RRule, gcalInput?: CreateGcalEventInput) => void
  teamRef: ScheduleMeetingButton_team$key
  placeholder: string
  withRecurrence?: boolean
}

const ScheduleMeetingButton = (props: Props) => {
  const {mutationProps, handleStartActivity, teamRef, placeholder, withRecurrence} = props
  const [open, setOpen] = useState(false)
  const {submitting} = mutationProps

  const team = useFragment(
    graphql`
      fragment ScheduleMeetingButton_team on Team {
        id
        viewerTeamMember {
          integrations {
            gcal {
              cloudProvider {
                id
              }
            }
          }
        }
        ...ScheduleDialog_team
      }
    `,
    teamRef
  )
  const {viewerTeamMember} = team

  const viewerGcalIntegration = viewerTeamMember?.integrations.gcal
  const cloudProvider = viewerGcalIntegration?.cloudProvider

  const onStartActivity = (name?: string, rrule?: RRule, gcalInput?: CreateGcalEventInput) => {
    handleStartActivity(name, rrule, gcalInput)
    setOpen(false)
  }

  if (!cloudProvider && !withRecurrence) return null
  return (
    <Dialog isOpen={open} onClose={() => setOpen(false)}>
      <DialogTrigger>
        <SecondaryButton waiting={submitting} className='h-14' onClick={() => setOpen(true)}>
          <div className='text-lg'>Schedule</div>
        </SecondaryButton>
      </DialogTrigger>
      <DialogContent noClose>
        <ScheduleDialog
          teamRef={team}
          placeholder={placeholder}
          onStartActivity={onStartActivity}
          onCancel={() => setOpen(false)}
          mutationProps={mutationProps}
          withRecurrence={withRecurrence}
        />
      </DialogContent>
    </Dialog>
  )
}

export default ScheduleMeetingButton
