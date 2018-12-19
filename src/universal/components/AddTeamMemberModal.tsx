import {AddTeamMemberModal_team} from '__generated__/AddTeamMemberModal_team.graphql'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import PrimaryButton from 'universal/components/PrimaryButton'
import parseEmailAddressList from 'universal/utils/parseEmailAddressList'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import InviteToTeamMutation from '../mutations/InviteToTeamMutation'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import AddTeamMemberModalBoundary from './AddTeamMemberModalBoundary'
import AddTeamMemberModalSuccess from './AddTeamMemberModalSuccess'
import BasicTextArea from './InputField/BasicTextArea'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogTitle from './InvitationDialogTitle'
import StyledError from './StyledError'

interface Props extends WithAtmosphereProps, WithMutationProps {
  closePortal: () => void
  team: AddTeamMemberModal_team
}

interface State {
  invitees: Array<string>
  successfulInvitations: null | Array<string>
  rawInvitees: string
}

const WideContent = styled(InvitationDialogContent)({
  minWidth: 500
})

const ButtonGroup = styled('div')({
  marginTop: '1rem',
  display: 'flex',
  justifyContent: 'flex-end'
})

const OffsetTitle = styled(InvitationDialogTitle)({
  paddingLeft: '1.75rem'
})

class AddTeamMemberModal extends Component<Props, State> {
  state = {
    successfulInvitations: null,
    rawInvitees: '',
    invitees: [] as Array<string>
  }
  onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {
      error,
      onCompleted,
      onError,
      team: {teamMembers}
    } = this.props
    const rawInvitees = e.target.value
    const parsedInvitees = parseEmailAddressList(rawInvitees)
    const allInvitees = parsedInvitees
      ? (parsedInvitees.map(({address}) => address) as Array<string>)
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
    const {invitees} = this.state
    if (invitees.length === 0) return
    setDirty()
    submitMutation()
    const handleCompleted = (res) => {
      onCompleted()
      if (res) {
        const {inviteToTeam} = res
        this.setState({
          successfulInvitations: inviteToTeam.invitees
        })
      }
    }
    InviteToTeamMutation(atmosphere, {teamId, invitees}, {onError, onCompleted: handleCompleted})
  }

  render () {
    const {error, submitting} = this.props
    const {invitees, successfulInvitations, rawInvitees} = this.state
    if (successfulInvitations) {
      return <AddTeamMemberModalSuccess successfulInvitations={successfulInvitations} />
    }
    const title = invitees.length <= 1 ? 'Send Invitation' : `Send ${invitees.length} Invitations`
    return (
      <AddTeamMemberModalBoundary>
        <OffsetTitle>Invite to Team</OffsetTitle>
        <WideContent>
          <BasicTextArea
            autoFocus
            name='rawInvitees'
            onChange={this.onChange}
            placeholder='email@example.co, another@example.co'
            value={rawInvitees}
          />
          {error && <StyledError>{error}</StyledError>}
          <ButtonGroup>
            <PrimaryButton
              onClick={this.sendInvitations}
              disabled={invitees.length === 0}
              waiting={submitting}
            >
              {title}
            </PrimaryButton>
          </ButtonGroup>
        </WideContent>
      </AddTeamMemberModalBoundary>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(AddTeamMemberModal)),
  graphql`
    fragment AddTeamMemberModal_team on Team {
      id
      teamMembers(sortBy: "preferredName") {
        email
      }
    }
  `
)
