import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import React, {useState} from 'react'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import {DialogDescription} from '../../../../ui/Dialog/DialogDescription'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import PrimaryButton from '../../../../components/PrimaryButton'
import {PALETTE} from '../../../../styles/paletteV3'
import DateTimePicker from './DateTimePicker'
import Checkbox from '../../../../components/Checkbox'
import StyledError from '../../../../components/StyledError'
import useForm from '../../../../hooks/useForm'
import Legitity from '../../../../validation/Legitity'
import {CreateGcalEventInput} from '../../../../__generated__/StartRetrospectiveMutation.graphql'
import {GcalModal_team$key} from '../../../../__generated__/GcalModal_team.graphql'
import BasicTextArea from '../../../../components/InputField/BasicTextArea'
import parseEmailAddressList from '../../../../utils/parseEmailAddressList'
import {useFragment} from 'react-relay'

const StyledInput = styled('input')({
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  color: PALETTE.SLATE_800,
  fontSize: 16,
  font: 'inherit',
  margin: '8px 0',
  padding: '12px 16px',
  outline: 0,
  width: '100%',
  '::placeholder': {
    color: PALETTE.SLATE_600
  }
})

const ErrorMessage = styled(StyledError)({
  textAlign: 'left',
  paddingBottom: 8
})

const validateTitle = (title: string) => {
  return new Legitity(title).trim().min(2, `C’mon, you call that a title?`)
}

interface Props {
  handleStartActivityWithGcalEvent: (CreateGcalEventInput: CreateGcalEventInput) => void
  closeModal: () => void
  isOpen: boolean
  teamRef: GcalModal_team$key
}

const GcalModal = (props: Props) => {
  const {handleStartActivityWithGcalEvent, closeModal, isOpen, teamRef} = props
  const startOfNextHour = dayjs().add(1, 'hour').startOf('hour')
  const endOfNextHour = dayjs().add(2, 'hour').startOf('hour')
  const [start, setStart] = useState(startOfNextHour)
  const [end, setEnd] = useState(endOfNextHour)
  const [inviteAll, setInviteAll] = useState(false)
  const [rawInvitees, setRawInvitees] = useState('')
  const [invitees, setInvitees] = useState([] as string[])

  const team = useFragment(
    graphql`
      fragment GcalModal_team on Team {
        name
        teamMembers {
          email
        }
      }
    `,
    teamRef
  )
  console.log('🚀 ~ team:', team)
  const {teamMembers, name: teamName} = team ?? {}

  const {fields, onChange} = useForm({
    title: {
      getDefault: () => ''
    },
    description: {
      getDefault: () => ''
    }
  })
  const titleErr = fields.title.error

  const handleClick = () => {
    const title = fields.title.value
    const titleRes = validateTitle(title)
    if (titleRes.error) {
      fields.title.setError(titleRes.error)
      return
    }
    const startTimestamp = start.unix()
    const endTimestamp = end.unix()
    const description = fields.description.value
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const input = {
      title,
      description,
      startTimestamp,
      endTimestamp,
      timeZone,
      emails: invitees
    }
    handleStartActivityWithGcalEvent(input)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (titleErr) {
      fields.title.setError('')
    }
    onChange(e)
  }

  const handleToggleInviteAll = () => {
    const teamMemberEmails = teamMembers?.map(({email}) => email)
    if (!inviteAll) {
      const {parsedInvitees} = parseEmailAddressList(rawInvitees)
      const currentInvitees = parsedInvitees
        ? (parsedInvitees.map((invitee: any) => invitee.address) as string[])
        : []
      const emailsToAdd = teamMemberEmails.filter((email) => !currentInvitees.includes(email))
      const lastInvitee = currentInvitees[currentInvitees.length - 1]
      const formattedCurrentInvitees =
        currentInvitees.length && lastInvitee && !lastInvitee.endsWith(',')
          ? `${currentInvitees.join(', ')}, `
          : currentInvitees.join(', ')
      setRawInvitees(`${formattedCurrentInvitees}${emailsToAdd.join(', ')}`)
      setInvitees([...currentInvitees, ...emailsToAdd])
    } else {
      const {parsedInvitees} = parseEmailAddressList(rawInvitees)
      const currentInvitees = parsedInvitees
        ? (parsedInvitees.map((invitee: any) => invitee.address) as string[])
        : []
      const remainingInvitees = currentInvitees.filter((email) => !teamMemberEmails.includes(email))
      setRawInvitees(remainingInvitees.join(', '))
      setInvitees(remainingInvitees)
    }
    setInviteAll((inviteAll) => !inviteAll)
  }

  return (
    <Dialog isOpen={isOpen} onClose={closeModal}>
      <DialogContent>
        <DialogTitle>Schedule Your Meeting</DialogTitle>
        <DialogDescription>
          {
            'Tell us when you want to meet and we’ll create a Google Calendar invite with a Parabol link'
          }
        </DialogDescription>
        <div className='space-y-1'>
          <div>
            <StyledInput
              autoFocus
              maxLength={100}
              defaultValue={fields.title.value}
              onChange={handleChange}
              name='title'
              placeholder='Enter the name of your meeting'
            />
            {titleErr && <ErrorMessage>{titleErr}</ErrorMessage>}
          </div>
          <StyledInput
            maxLength={100}
            name='description'
            onChange={onChange}
            placeholder='Enter your meeting description (optional)'
          />
          <div className='pt-2'>
            <DateTimePicker startValue={start} endValue={end} setStart={setStart} setEnd={setEnd} />
          </div>
          <p className='mb-3 pt-4 text-xs leading-4'>
            {'Invite others to your Google Calendar event'}
          </p>
          <BasicTextArea
            name='rawInvitees'
            onChange={(e) => setRawInvitees(e.target.value)}
            placeholder='email@example.co, another@example.co'
            value={rawInvitees}
          />
          <div className='flex cursor-pointer items-center pt-2' onClick={handleToggleInviteAll}>
            <Checkbox active={inviteAll} />
            <label htmlFor='checkbox' className='text-gray-700 ml-2 cursor-pointer'>
              {`Invite team members from ${teamName}`}
            </label>
          </div>
        </div>
        <DialogActions>
          <PrimaryButton size='medium' onClick={handleClick}>
            {`Create Meeting & Gcal Invite`}
          </PrimaryButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default GcalModal
