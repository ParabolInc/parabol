import {AddTeamMemberModal_team} from '../__generated__/AddTeamMemberModal_team.graphql'
import React, {Component} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import PrimaryButton from './PrimaryButton'
import parseEmailAddressList from '../utils/parseEmailAddressList'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import InviteToTeamMutation from '../mutations/InviteToTeamMutation'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import AddTeamMemberModalSuccess from './AddTeamMemberModalSuccess'
import BasicTextArea from './InputField/BasicTextArea'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import StyledError from './StyledError'
import {AddTeamMemberModal_teamMembers} from '../__generated__/AddTeamMemberModal_teamMembers.graphql'
import plural from '../utils/plural'
import makeHref from '../utils/makeHref'
import CopyShortLink from '../modules/meeting/components/CopyShortLink/CopyShortLink'
import LabelHeading from './LabelHeading/LabelHeading'
import {PALETTE} from '../styles/paletteV2'
import useBreakpoint from '../hooks/useBreakpoint'

interface Props extends WithAtmosphereProps, WithMutationProps {
  closePortal: () => void
  teamMembers: AddTeamMemberModal_teamMembers
  team: AddTeamMemberModal_team
}

interface State {
  invitees: string[]
  pendingSuccessfulInvitations: string[]
  successfulInvitations: null | string[]
  rawInvitees: string
}

const INVITE_DIALOG_WITH_ILLUS = 864

const StyledDialogContainer = styled(DialogContainer)({
  width: 480,
  [`@media (min-width: ${INVITE_DIALOG_WITH_ILLUS}px)`]: {
    width: 816
  }
})

const StyledDialogTitle = styled(DialogTitle)({
  [`@media (min-width: ${INVITE_DIALOG_WITH_ILLUS}px)`]: {
    fontSize: 24,
    lineHeight: '32px',
    marginBottom: 8,
    paddingLeft: 32,
    paddingTop: 24
  }
})

const StyledDialogContent = styled(DialogContent)({
  [`@media (min-width: ${INVITE_DIALOG_WITH_ILLUS}px)`]: {
    alignItems: 'center',
    display: 'flex',
    padding: '16px 32px 32px'
  }
})

const Fields = styled('div')({
  [`@media (min-width: ${INVITE_DIALOG_WITH_ILLUS}px)`]: {
    maxWidth: 320,
    marginRight: 32
  }
})

const Illustration = styled('img')({
  display: 'block',
  flex: 1,
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

const StyledCopyShortLink = styled(CopyShortLink)({
  borderRadius: 4,
  border: `1px dashed ${PALETTE.EMPHASIS_COOL_LIGHTER}`,
  color: PALETTE.EMPHASIS_COOL,
  fontSize: 15,
  margin: '0 0 32px',
  padding: 11,
  ':hover': {
    color: PALETTE.EMPHASIS_COOL_LIGHTER
  }
})

const IllustrationBlock = () => {
  const showIllustration = useBreakpoint(INVITE_DIALOG_WITH_ILLUS)
  const imageSrc =
    'https://s3.amazonaws.com/action-files.parabol.co/static/illustrations/illus-momentum.png' ||
    `${__STATIC_IMAGES__}/illustrations/illus-momentum.png`
  return <>{showIllustration && <Illustration alt='' src={imageSrc} />}</>
}

class AddTeamMemberModal extends Component<Props, State> {
  _mounted = true
  state: State = {
    pendingSuccessfulInvitations: [] as string[],
    successfulInvitations: null,
    rawInvitees: '',
    invitees: [] as string[]
  }

  onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {error, onCompleted, onError, teamMembers} = this.props
    const rawInvitees = e.target.value
    const parsedInvitees = parseEmailAddressList(rawInvitees)
    const allInvitees = parsedInvitees
      ? (parsedInvitees.map(({address}) => address) as string[])
      : this.state.invitees
    const teamEmailSet = new Set(teamMembers.map(({email}) => email))
    const uniqueInvitees = Array.from(new Set(allInvitees))
    const offTeamInvitees = uniqueInvitees.filter((email) => !teamEmailSet.has(email))
    const alreadyInvitedEmail = uniqueInvitees.find((email) => teamEmailSet.has(email))
    this.setState({
      rawInvitees,
      invitees: offTeamInvitees
    })
    if (alreadyInvitedEmail) {
      onError(`${alreadyInvitedEmail} is already on the team`)
    } else if (error) {
      onCompleted()
    }
  }

  sendInvitations = () => {
    const {atmosphere, onError, onCompleted, submitMutation, setDirty, team} = this.props
    const {id: teamId} = team
    const {invitees, pendingSuccessfulInvitations} = this.state
    if (invitees.length === 0) return
    setDirty()
    submitMutation()
    const handleCompleted = (res) => {
      onCompleted()
      if (res) {
        const {inviteToTeam} = res
        if (this._mounted) {
          if (inviteToTeam.invitees.length === invitees.length) {
            this.setState({
              successfulInvitations: pendingSuccessfulInvitations.concat(inviteToTeam.invitees)
            })
          } else {
            // there was a problem with at least 1 email
            const goodInvitees = invitees.filter((invitee) =>
              inviteToTeam.invitees.includes(invitee)
            )

            const badInvitees = invitees.filter(
              (invitee) => !inviteToTeam.invitees.includes(invitee)
            )
            onError(
              `Could not send an invitation to the above ${plural(badInvitees.length, 'email')}`
            )
            this.setState({
              invitees: badInvitees,
              rawInvitees: badInvitees.join(', '),
              // store the successes in a list so the user gets a confirmation that all emails were sent
              pendingSuccessfulInvitations: pendingSuccessfulInvitations.concat(goodInvitees)
            })
          }
        }
      }
    }
    InviteToTeamMutation(atmosphere, {teamId, invitees}, {onError, onCompleted: handleCompleted})
  }

  componentWillUnmount() {
    this._mounted = false
  }

  render() {
    const {closePortal, error, submitting, team} = this.props
    const {invitees, successfulInvitations, rawInvitees} = this.state
    const {massInviteToken} = team
    if (successfulInvitations) {
      return (
        <AddTeamMemberModalSuccess
          closePortal={closePortal}
          successfulInvitations={successfulInvitations}
        />
      )
    }
    const url = makeHref(`/invitation-link/${massInviteToken}`)
    const title = invitees.length <= 1 ? 'Send Invitation' : `Send ${invitees.length} Invitations`
    return (
      <StyledDialogContainer>
        <StyledDialogTitle>Invite to Team</StyledDialogTitle>
        <StyledDialogContent>
          <Fields>
            <StyledLabelHeading>{'Share this link'}</StyledLabelHeading>
            <StyledCopyShortLink
              icon='link'
              url={url}
              label={url.slice(0, 45) + '…'}
              title={'Copy invite link'}
              tooltip={'Copied! Valid for 1 day'}
            />
            <StyledLabelHeading>{'Or, send invites by email'}</StyledLabelHeading>
            <BasicTextArea
              autoFocus
              name='rawInvitees'
              onChange={this.onChange}
              placeholder='email@example.co, another@example.co'
              value={rawInvitees}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <ButtonGroup>
              <PrimaryButton
                onClick={this.sendInvitations}
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
}

export default createFragmentContainer(withAtmosphere(withMutationProps(AddTeamMemberModal)), {
  team: graphql`
    fragment AddTeamMemberModal_team on Team {
      id
      massInviteToken
    }
  `,
  teamMembers: graphql`
    fragment AddTeamMemberModal_teamMembers on TeamMember @relay(plural: true) {
      email
    }
  `
})
