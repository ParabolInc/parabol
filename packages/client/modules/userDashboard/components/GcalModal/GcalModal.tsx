import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import dayjs, {Dayjs} from 'dayjs'
import * as React from 'react'
import {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import {GcalModal_team$key} from '../../../../__generated__/GcalModal_team.graphql'
import {CreateGcalEventInput} from '../../../../__generated__/StartRetrospectiveMutation.graphql'
import {GcalVideoTypeEnum} from '../../../../__generated__/StartTeamPromptMutation.graphql'
import Checkbox from '../../../../components/Checkbox'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import BasicTextArea from '../../../../components/InputField/BasicTextArea'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import PrimaryButton from '../../../../components/PrimaryButton'
import StyledError from '../../../../components/StyledError'
import useForm from '../../../../hooks/useForm'
import {PALETTE} from '../../../../styles/paletteV3'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import parseEmailAddressList from '../../../../utils/parseEmailAddressList'
import Legitity from '../../../../validation/Legitity'
import DateTimePickers from './DateTimePickers'
import VideoConferencing from './VideoConferencing'

const Wrapper = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingTop: 16
})

const StyledDialogContainer = styled(DialogContainer)({
  width: 'auto',
  overflowY: 'scroll'
})

const CloseIcon = styled(Close)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.5
  }
})

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  marginLeft: 'auto'
})

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
  teamRef: GcalModal_team$key
}

const GcalModal = (props: Props) => {
  const {handleStartActivityWithGcalEvent, closeModal, teamRef} = props
  const startOfNextHour = dayjs().add(1, 'hour').startOf('hour')
  const endOfNextHour = dayjs().add(2, 'hour').startOf('hour')
  const [start, setStart] = useState(startOfNextHour)
  const [end, setEnd] = useState(endOfNextHour)
  const [inviteAll, setInviteAll] = useState(true)
  const [inviteError, setInviteError] = useState<null | string>(null)
  const [rawInvitees, setRawInvitees] = useState('')
  const [invitees, setInvitees] = useState([] as string[])
  const [videoType, setVideoType] = useState<GcalVideoTypeEnum | null>(null)

  const team = useFragment(
    graphql`
      fragment GcalModal_team on Team {
        name
        teamMembers {
          user {
            email
          }
          isSelf
        }
      }
    `,
    teamRef
  )
  const {teamMembers, name: teamName} = team ?? {}
  const teamMemberEmails = teamMembers?.filter(({isSelf}) => !isSelf).map(({user}) => user.email)
  const hasTeamMemberEmails = teamMemberEmails?.length > 0

  const {fields, onChange} = useForm({
    title: {
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
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const input = {
      title,
      startTimestamp,
      endTimestamp,
      timeZone,
      invitees,
      videoType: videoType ?? undefined
    }
    handleStartActivityWithGcalEvent(input)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (titleErr) {
      fields.title.setError('')
    }
    onChange(e)
  }

  const onInvitesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value
    if (rawInvitees === nextValue) return
    const {parsedInvitees, invalidEmailExists} = parseEmailAddressList(nextValue)
    const allInvitees = parsedInvitees
      ? (parsedInvitees.map((invitee: any) => invitee.address) as string[])
      : []
    const uniqueInvitees = Array.from(new Set(allInvitees))
    if (invalidEmailExists) {
      const lastValidEmail = uniqueInvitees[uniqueInvitees.length - 1]
      lastValidEmail
        ? setInviteError(`Invalid email(s) after ${lastValidEmail}`)
        : setInviteError(`Invalid email(s)`)
    } else {
      setInviteError(null)
    }
    setRawInvitees(nextValue)
    setInvitees(uniqueInvitees)
  }

  const addAllTeamMembers = () => {
    const {parsedInvitees} = parseEmailAddressList(rawInvitees)
    const currentInvitees = parsedInvitees
      ? (parsedInvitees as emailAddresses.ParsedMailbox[]).map((invitee) => invitee.address)
      : []
    const emailsToAdd = teamMemberEmails.filter((email) => !currentInvitees.includes(email))
    const lastInvitee = currentInvitees[currentInvitees.length - 1]
    const formattedCurrentInvitees =
      currentInvitees.length && lastInvitee && !lastInvitee.endsWith(',')
        ? `${currentInvitees.join(', ')}, `
        : currentInvitees.join(', ')
    setRawInvitees(`${formattedCurrentInvitees}${emailsToAdd.join(', ')}`)
    setInvitees([...currentInvitees, ...emailsToAdd])
  }

  useEffect(() => {
    if (hasTeamMemberEmails) {
      addAllTeamMembers()
    }
  }, [hasTeamMemberEmails])

  const removeAllTeamMembers = () => {
    const {parsedInvitees} = parseEmailAddressList(rawInvitees)
    const currentInvitees = parsedInvitees
      ? (parsedInvitees.map((invitee: any) => invitee.address) as string[])
      : []
    const remainingInvitees = currentInvitees.filter((email) => !teamMemberEmails.includes(email))
    setRawInvitees(remainingInvitees.join(', '))
    setInvitees(remainingInvitees)
  }

  const handleToggleInviteAll = () => {
    if (!inviteAll) {
      addAllTeamMembers()
    } else {
      removeAllTeamMembers()
    }
    setInviteAll((inviteAll) => !inviteAll)
  }

  const handleChangeVideoType = (option: GcalVideoTypeEnum | null) => {
    setVideoType(option)
  }

  const handleChangeStart = (date: Dayjs | null, time: Dayjs | null) => {
    if (date && time) {
      const newValue = date.hour(time.hour()).minute(time.minute())
      setStart(newValue)
      setEnd(newValue.add(1, 'hour'))
    }
  }

  const handleChangeEnd = (date: Dayjs | null, time: Dayjs | null) => {
    if (date && time) {
      const newValue = date.hour(time.hour()).minute(time.minute())
      if (newValue.isAfter(start)) {
        setEnd(newValue)
      } else {
        const newStartValue = newValue.subtract(1, 'hour')
        setStart(newStartValue)
        setEnd(newValue)
      }
    }
  }

  return (
    <StyledDialogContainer>
      <DialogTitle>
        <div className='flex flex-col'>
          <div className='text-lg'>{'Schedule Your Meeting'}</div>
          <div className='text-gray-500 mt-1 text-sm font-normal'>
            Create a Google Calendar event with a link to the Parabol meeting in the description
          </div>
        </div>
        <StyledCloseButton onClick={closeModal}>
          <CloseIcon />
        </StyledCloseButton>
      </DialogTitle>
      <DialogContent>
        <div className='space-y-2'>
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
          <div className='pt-1'>
            <DateTimePickers
              startValue={start}
              endValue={end}
              handleChangeStart={handleChangeStart}
              handleChangeEnd={handleChangeEnd}
            />
          </div>
          <VideoConferencing videoType={videoType} handleChangeVideoType={handleChangeVideoType} />
          <p className='pt-2 text-xs leading-4'>{'Invite others to your Google Calendar event'}</p>
          <BasicTextArea
            name='rawInvitees'
            onChange={onInvitesChange}
            placeholder='email@example.co, another@example.co'
            value={rawInvitees}
          />
          {hasTeamMemberEmails && (
            <div className='flex cursor-pointer items-center pt-1' onClick={handleToggleInviteAll}>
              <Checkbox active={inviteAll} />
              <label htmlFor='checkbox' className='text-gray-700 ml-2 cursor-pointer'>
                {`Invite team members from ${teamName}`}
              </label>
            </div>
          )}
          {inviteError && <ErrorMessage>{inviteError}</ErrorMessage>}
        </div>
        <Wrapper>
          <DialogActions>
            <PrimaryButton size='medium' onClick={handleClick}>
              {`Create Meeting & Gcal Invite`}
            </PrimaryButton>
          </DialogActions>
        </Wrapper>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default GcalModal
