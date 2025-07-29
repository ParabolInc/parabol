import {EventRepeat, ExpandMore} from '@mui/icons-material'
import * as Collapsible from '@radix-ui/react-collapsible'
import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import * as React from 'react'
import {type ChangeEvent, useState} from 'react'
import {useFragment} from 'react-relay'
import type {RRule} from 'rrule'
import type {ScheduleDialog_team$key} from '~/__generated__/ScheduleDialog_team.graphql'
import type {CreateGcalEventInput} from '../__generated__/StartRetrospectiveMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import GcalSettings, {
  type GcalEventInput
} from '../modules/userDashboard/components/GcalModal/GcalSettings'
import logo from '../styles/theme/images/graphics/google.svg'
import gcalLogo from '../styles/theme/images/graphics/google-calendar.svg'
import {cn} from '../ui/cn'
import {DialogActions} from '../ui/Dialog/DialogActions'
import GcalClientManager from '../utils/GcalClientManager'
import {toHumanReadable} from '../utils/humanReadableRecurrenceRule'
import plural from '../utils/plural'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import Legitity from '../validation/Legitity'
import PrimaryButton from './PrimaryButton'
import {RecurrenceSettings} from './Recurrence/RecurrenceSettings'
import SecondaryButton from './SecondaryButton'
import StyledError from './StyledError'

const validateTitle = (title: string) =>
  new Legitity(title).trim().min(2, `C’mon, you call that a title?`)

interface Props {
  onStartActivity: (name?: string, rrule?: RRule, gcalInput?: CreateGcalEventInput) => void
  placeholder: string
  teamRef: ScheduleDialog_team$key
  onCancel: () => void
  mutationProps: MenuMutationProps
  withRecurrence?: boolean
}

export const ScheduleDialog = (props: Props) => {
  const {placeholder, teamRef, onCancel, mutationProps, withRecurrence} = props
  const [rrule, setRrule] = useState<RRule | null>(null)
  const [openRecurrence, setOpenRecurrence] = React.useState(!!rrule)
  const [openGcalEvent, setOpenGcalEvent] = React.useState(true)
  const [addedInvite, setAddedInvite] = React.useState(false)

  const [gcalInput, setGcalInput] = useState<GcalEventInput>({
    start: dayjs().add(1, 'hour').startOf('hour'),
    end: dayjs().add(2, 'hour').startOf('hour'),
    invitees: [],
    videoType: null
  })

  const team = useFragment(
    graphql`
      fragment ScheduleDialog_team on Team {
        id
        viewerTeamMember {
          isSelf
          integrations {
            gcal {
              auth {
                id
              }
              cloudProvider {
                id
                clientId
              }
            }
          }
        }
        ...GcalModal_team
        ...GcalSettings_team
      }
    `,
    teamRef
  )

  const {id: teamId, viewerTeamMember} = team
  const {gcal} = viewerTeamMember?.integrations ?? {}

  const atmosphere = useAtmosphere()
  const {fields, onChange} = useForm({
    title: {
      getDefault: () => ''
    }
  })
  const title = fields.title.value
  const titleErr = fields.title.error

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (titleErr) {
      fields.title.setError('')
    }
    onChange(event)
  }

  const handleSubmit = () => {
    const name = fields.title.value || placeholder
    const nameRes = validateTitle(name)
    if (nameRes.error) {
      fields.title.setError(nameRes.error)
      return
    }

    const gcalEventInput = addedInvite
      ? {
          startTimestamp: gcalInput.start.unix(),
          endTimestamp: gcalInput.end.unix(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          invitees: gcalInput.invitees,
          videoType: gcalInput.videoType ?? undefined
        }
      : undefined
    props.onStartActivity(name, rrule ?? undefined, gcalEventInput)
  }

  const onAddInvite = () => {
    if (!gcal?.cloudProvider) {
      return
    }
    if (!gcal?.auth) {
      const {clientId, id: providerId} = gcal.cloudProvider
      GcalClientManager.openOAuth(atmosphere, providerId, clientId, teamId, mutationProps)

      SendClientSideEvent(atmosphere, 'Schedule meeting add gcal clicked', {
        teamId: teamId,
        service: 'gcal'
      })
      setAddedInvite(true)
    } else {
      setAddedInvite(true)
    }
  }

  const subTitle = `Create a ${withRecurrence ? 'recurring meeting series' : 'meeting'}${gcal?.cloudProvider ? ' or add the meeting to your calendar.' : '.'}`
  return (
    <div className='space-y-4 overflow-auto p-4'>
      <div className='font-semibold text-lg leading-none'>Schedule Your Meeting</div>
      <div className='text-slate-800 text-sm'>{subTitle}</div>
      <div className='flex flex-col'>
        <input
          className='form-input rounded-sm border border-slate-500 border-solid p-2 font-sans text-base hover:border-slate-600 focus:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-slate-600'
          type='text'
          name='title'
          placeholder={placeholder}
          value={title}
          onChange={onNameChange}
          min={1}
          max={50}
        />
        {titleErr && <StyledError>{titleErr}</StyledError>}
      </div>
      {gcal?.cloudProvider &&
        (gcal?.auth && addedInvite ? (
          <Collapsible.Root
            className='flex flex-col rounded-sm border border-slate-500'
            open={openGcalEvent}
            onOpenChange={setOpenGcalEvent}
          >
            <Collapsible.Trigger className='flex cursor-pointer items-center bg-transparent p-2'>
              <img src={gcalLogo} className='mr-2 h-6 w-6' />
              <div className='grow text-left font-semibold text-lg leading-none'>
                {gcalInput.start.format('MMM D, h:mm A')} - {gcalInput.end.format('h:mm A')}
                {gcalInput.invitees.length > 0 &&
                  `, ${gcalInput.invitees.length} ${plural(gcalInput.invitees.length, 'invitee')}`}
              </div>
              <ExpandMore className={cn(openGcalEvent && 'rotate-180')} />
            </Collapsible.Trigger>
            <Collapsible.Content className='space-y-4'>
              <GcalSettings teamRef={team} settings={gcalInput} onSettingsChanged={setGcalInput} />
            </Collapsible.Content>
          </Collapsible.Root>
        ) : (
          <div>
            <SecondaryButton className='h-11 pr-4 pl-3' onClick={onAddInvite}>
              <img src={logo} className='mr-2' />
              {gcal?.auth ? 'Add Calendar Event' : 'Connect to Google Calendar'}
            </SecondaryButton>
          </div>
        ))}
      {withRecurrence && (
        <Collapsible.Root
          className='flex flex-col rounded-sm border border-slate-500'
          open={openRecurrence}
          onOpenChange={setOpenRecurrence}
        >
          <Collapsible.Trigger className='flex cursor-pointer items-center justify-between bg-transparent p-2'>
            <EventRepeat className='mr-2 text-slate-600' />
            <div className='grow text-left font-semibold text-lg leading-none'>
              {rrule
                ? toHumanReadable(rrule, {
                    useShortNames: true,
                    shortDayNameAfter: 1
                  })
                : 'Does not restart'}
            </div>
            <ExpandMore className={cn(openRecurrence && 'rotate-180')} />
          </Collapsible.Trigger>
          <Collapsible.Content className='space-y-4'>
            <RecurrenceSettings rrule={rrule} onRruleUpdated={setRrule} />
          </Collapsible.Content>
        </Collapsible.Root>
      )}
      <DialogActions>
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton size='medium' onClick={handleSubmit}>
          Create Meeting
        </PrimaryButton>
      </DialogActions>
    </div>
  )
}
