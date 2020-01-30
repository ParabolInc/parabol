import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from 'hooks/useAtmosphere'
import useMutationProps from 'hooks/useMutationProps'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useBreakpoint from '../hooks/useBreakpoint'
import InviteToTeamMutation from '../mutations/InviteToTeamMutation'
import parseEmailAddressList from '../utils/parseEmailAddressList'
import plural from '../utils/plural'
import {AddTeamMemberModal_teamMembers} from '../__generated__/AddTeamMemberModal_teamMembers.graphql'
import AddTeamMemberModalSuccess from './AddTeamMemberModalSuccess'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import BasicTextArea from './InputField/BasicTextArea'
import LabelHeading from './LabelHeading/LabelHeading'
import MassInvitationTokenLinkRoot from './MassInvitationTokenLinkRoot'
import PrimaryButton from './PrimaryButton'
import StyledError from './StyledError'

interface Props {
  closePortal: () => void
  meetingId?: string | undefined
  teamMembers: AddTeamMemberModal_teamMembers
  teamId: string
}

const INVITE_DIALOG_BREAKPOINT = 864
const INVITE_DIALOG_MEDIA_QUERY = `@media (min-width: ${INVITE_DIALOG_BREAKPOINT}px)`

const StyledDialogContainer = styled(DialogContainer)({
  width: 480,
  [INVITE_DIALOG_MEDIA_QUERY]: {
    width: 816
  }
})

const StyledDialogTitle = styled(DialogTitle)({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    fontSize: 24,
    lineHeight: '32px',
    marginBottom: 8,
    paddingLeft: 32,
    paddingTop: 24
  }
})

const StyledDialogContent = styled(DialogContent)({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    alignItems: 'center',
    display: 'flex',
    padding: '16px 32px 32px'
  }
})

const Fields = styled('div')({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    maxWidth: 320
  }
})

const Illustration = styled('img')({
  display: 'block',
  flex: 1,
  marginLeft: 32,
  marginTop: -60,
  maxWidth: 400
})

const ButtonGroup = styled('div')({
  marginTop: '24px',
  display: 'flex',
  justifyContent: 'flex-end'
})

const ErrorMessage = styled(StyledError)({
  fontSize: '.8125rem',
  marginTop: '.5rem'
})

const StyledLabelHeading = styled(LabelHeading)({
  alignItems: 'center',
  display: 'flex',
  fontSize: 15,
  lineHeight: '21px',
  padding: '0 0 16px',
  textTransform: 'none'
})

const IllustrationBlock = () => {
  const showIllustration = useBreakpoint(INVITE_DIALOG_BREAKPOINT)
  const imageSrc = `${__STATIC_IMAGES__}/illustrations/illus-momentum.png`
  return showIllustration ? <Illustration alt='' src={imageSrc} /> : null
}

const AddTeamMemberModal = (props: Props) => {
  const {closePortal, meetingId, teamMembers, teamId} = props
  const [pendingSuccessfulInvitations, setPendingSuccessfulInvitations] = useState([] as string[])
  const [successfulInvitations, setSuccessfulInvitations] = useState<string[] | null>(null)
  const [rawInvitees, setRawInvitees] = useState('')
  const [invitees, setInvitees] = useState([] as string[])
  const {error, onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const atmosphere = useAtmosphere()
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value
    if (rawInvitees === nextValue) return
    const parsedInvitees = parseEmailAddressList(nextValue)
    const allInvitees = parsedInvitees
      ? (parsedInvitees.map(({address}) => address) as string[])
      : invitees
    const teamEmailSet = new Set(teamMembers.map(({email}) => email))
    const uniqueInvitees = Array.from(new Set(allInvitees))
    const offTeamInvitees = uniqueInvitees.filter((email) => !teamEmailSet.has(email))
    const alreadyInvitedEmail = uniqueInvitees.find((email) => teamEmailSet.has(email))
    setRawInvitees(nextValue)
    setInvitees(offTeamInvitees)
    if (alreadyInvitedEmail) {
      onError(new Error(`${alreadyInvitedEmail} is already on the team`))
    } else if (error) {
      onCompleted()
    }
  }

  const sendInvitations = () => {
    if (invitees.length === 0) return
    submitMutation()
    const handleCompleted = (res) => {
      onCompleted()
      if (res) {
        const {inviteToTeam} = res
        if (inviteToTeam.invitees.length === invitees.length) {
          setSuccessfulInvitations(pendingSuccessfulInvitations.concat(inviteToTeam.invitees))
        } else {
          // there was a problem with at least 1 email
          const goodInvitees = invitees.filter((invitee) => inviteToTeam.invitees.includes(invitee))

          const badInvitees = invitees.filter((invitee) => !inviteToTeam.invitees.includes(invitee))
          onError(
            new Error(
              `Could not send an invitation to the above ${plural(badInvitees.length, 'email')}`
            )
          )
          setInvitees(badInvitees)
          setRawInvitees(badInvitees.join(', '))
          // store the successes in a list so the user gets a confirmation that all emails were sent
          setPendingSuccessfulInvitations(pendingSuccessfulInvitations.concat(goodInvitees))
        }
      }
    }
    InviteToTeamMutation(
      atmosphere,
      {meetingId, teamId, invitees},
      {onError, onCompleted: handleCompleted}
    )
  }

  if (successfulInvitations) {
    return (
      <AddTeamMemberModalSuccess
        closePortal={closePortal}
        successfulInvitations={successfulInvitations}
      />
    )
  }
  const title = invitees.length <= 1 ? 'Send Invitation' : `Send ${invitees.length} Invitations`
  return (
    <StyledDialogContainer>
      <StyledDialogTitle>Invite to Team</StyledDialogTitle>
      <StyledDialogContent>
        <Fields>
          <StyledLabelHeading>{'Share this link'}</StyledLabelHeading>
          <MassInvitationTokenLinkRoot meetingId={meetingId} teamId={teamId} />

          <StyledLabelHeading>{'Or, send invites by email'}</StyledLabelHeading>
          <BasicTextArea
            autoFocus
            name='rawInvitees'
            onChange={onChange}
            placeholder='email@example.co, another@example.co'
            value={rawInvitees}
          />
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
          <ButtonGroup>
            <PrimaryButton
              onClick={sendInvitations}
              disabled={invitees.length === 0}
              size='medium'
              waiting={submitting}
            >
              {title}
            </PrimaryButton>
          </ButtonGroup>
        </Fields>
        <IllustrationBlock />
      </StyledDialogContent>
    </StyledDialogContainer>
  )
}

export default createFragmentContainer(AddTeamMemberModal, {
  teamMembers: graphql`
    fragment AddTeamMemberModal_teamMembers on TeamMember @relay(plural: true) {
      email
    }
  `
})
