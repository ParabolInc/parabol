import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import React, {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import {GcalModal_team$key} from '../../../../__generated__/GcalModal_team.graphql'
import {GcalVideoTypeEnum} from '../../../../__generated__/StartTeamPromptMutation.graphql'
import Checkbox from '../../../../components/Checkbox'
import BasicTextArea from '../../../../components/InputField/BasicTextArea'
import StyledError from '../../../../components/StyledError'
import parseEmailAddressList from '../../../../utils/parseEmailAddressList'
import DateTimePickers from './DateTimePickers'
import VideoConferencing from './VideoConferencing'

const ErrorMessage = styled(StyledError)({
  textAlign: 'left',
  paddingBottom: 8
})

export interface GcalEventInput {
  start: dayjs.Dayjs
  end: dayjs.Dayjs
  invitees: string[]
  videoType: GcalVideoTypeEnum | null
}

interface Props {
  teamRef: GcalModal_team$key
  onSettingsChanged: (input: GcalEventInput) => void
  settings: GcalEventInput
}

const GcalSettings = (props: Props) => {
  const {teamRef, settings, onSettingsChanged} = props
  const {invitees, start, end, videoType} = settings
  const [rawInvitees, setRawInvitees] = useState(invitees.join(', '))
  const [inviteAll, setInviteAll] = useState(true)

  const [inviteError, setInviteError] = useState<null | string>(null)

  const setInvitees = (invitees: string[]) => {
    onSettingsChanged({...settings, invitees})
  }
  const setVideoType = (videoType: GcalVideoTypeEnum | null) => {
    onSettingsChanged({...settings, videoType})
  }

  const setStart = (start: dayjs.Dayjs) => {
    onSettingsChanged({...settings, start})
  }
  const setEnd = (end: dayjs.Dayjs) => {
    onSettingsChanged({...settings, end})
  }

  const team = useFragment(
    graphql`
      fragment GcalSettings_team on Team {
        name
        teamMembers {
          email
          isSelf
        }
      }
    `,
    teamRef
  )
  const {teamMembers, name: teamName} = team ?? {}
  const teamMemberEmails = teamMembers?.filter(({isSelf}) => !isSelf).map(({email}) => email)
  const hasTeamMemberEmails = teamMemberEmails?.length > 0

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

  return (
    <div className='space-y-4 p-4'>
      <div className='pt-1'>
        <DateTimePickers startValue={start} endValue={end} setStart={setStart} setEnd={setEnd} />
      </div>
      <VideoConferencing
        videoType={videoType ?? null}
        handleChangeVideoType={handleChangeVideoType}
      />
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
  )
}

export default GcalSettings
