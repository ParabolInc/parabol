import React, {Component} from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import {randomPlaceholderTheme} from 'universal/utils/makeRandomPlaceholder'
import parseEmailAddressList from 'universal/utils/parseEmailAddressList'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import InviteToTeamMutation from '../mutations/InviteToTeamMutation'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import BasicTextArea from './InputField/BasicTextArea'

const ModalBoundary = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  background: ui.palette.white,
  borderRadius: ui.modalBorderRadius,
  height: 374,
  width: 700
})

interface Props extends WithAtmosphereProps, WithMutationProps {
  closePortal: () => void
  teamId: string
}

interface State {
  invitees: Array<string>
  rawInvitees: string
}

class AddTeamMemberModal extends Component<Props, State> {
  state = {
    rawInvitees: '',
    invitees: []
  }
  onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawInvitees = e.target.value
    const invitees = parseEmailAddressList(rawInvitees) || []
    this.setState({
      rawInvitees,
      invitees
    })
  }

  sendInvitations = () => {
    const {atmosphere, onError, onCompleted, submitMutation, setDirty, teamId} = this.props
    const {invitees} = this.state
    if (invitees.length === 0) return
    setDirty()
    submitMutation()
    InviteToTeamMutation(atmosphere, {teamId, invitees}, {onError, onCompleted})
  }

  render () {
    const {dirty, error} = this.props
    const {invitees, rawInvitees} = this.state
    const title = invitees.length <= 1 ? 'Send Invitation' : `Send ${invitees.length} Invitations`
    return (
      <ModalBoundary>
        <span>Type in invitee emails</span>
        <BasicTextArea
          error={dirty ? (error as string) : undefined}
          name='rawInvitees'
          onChange={this.onChange}
          placeholder={randomPlaceholderTheme.emailMulti}
          value={rawInvitees}
        />
        <button onClick={this.sendInvitations} disabled={invitees.length === 0}>
          {title}
        </button>
      </ModalBoundary>
    )
  }
}

export default withAtmosphere(withMutationProps(AddTeamMemberModal))
