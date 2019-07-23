import {AddTeamMemberModal_team} from '__generated__/AddTeamMemberModal_team.graphql'
import React, {Component} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer, graphql} from 'react-relay'
import PrimaryButton from 'universal/components/PrimaryButton'
import parseEmailAddressList from 'universal/utils/parseEmailAddressList'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import InviteToTeamMutation from '../mutations/InviteToTeamMutation'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import AddTeamMemberModalSuccess from './AddTeamMemberModalSuccess'
import BasicTextArea from './InputField/BasicTextArea'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import StyledError from './StyledError'
import {AddTeamMemberModal_teamMembers} from '__generated__/AddTeamMemberModal_teamMembers.graphql'
import plural from 'universal/utils/plural'
import makeHref from 'universal/utils/makeHref'
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink'
import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator'

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

const StyledDialogContainer = styled(DialogContainer)({
  width: 500
})

const ButtonGroup = styled('div')({
  marginTop: '1rem',
  display: 'flex',
  justifyContent: 'flex-end'
})

const ErrorMessage = styled(StyledError)({
  fontSize: '.8125rem',
  marginTop: '.5rem'
})

const ShareableLink = styled('div')({
  display: 'flex',
  justifyContent: 'center'
})

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

  componentWillUnmount () {
    this._mounted = false
  }

  render () {
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
        <DialogTitle>Invite to Team</DialogTitle>
        <DialogContent>
          <BasicTextArea
            autoFocus
            name='rawInvitees'
            onChange={this.onChange}
            placeholder='email@example.co, another@example.co'
            value={rawInvitees}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <HorizontalSeparator text={'or, share this link'} />
          <ShareableLink>
            <CopyShortLink
              url={url}
              label={url.slice(0, 45) + '…'}
              tooltip={'Copied! Valid for 1 day'}
            />
          </ShareableLink>
          <ButtonGroup>
            <PrimaryButton
              onClick={this.sendInvitations}
              disabled={invitees.length === 0}
              waiting={submitting}
            >
              {title}
            </PrimaryButton>
          </ButtonGroup>
        </DialogContent>
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
