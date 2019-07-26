import React, {Component} from 'react'
import styled from 'react-emotion'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import {PALETTE} from '../styles/paletteV2'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import Auth0ClientManager from 'universal/utils/Auth0ClientManager'

interface Props extends WithMutationProps {
  email: string
}

const ForgotButton = styled(PlainButton)({
  color: PALETTE.LINK_BLUE,
  marginTop: '1rem'
})

const MessageSent = styled('div')({
  marginTop: '1rem',
  userSelect: 'none',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
})

class ForgotPasswordOneClick extends Component<Props> {
  state = {
    isSent: false
  }
  onClick = async () => {
    const {email, submitMutation, submitting, onCompleted} = this.props
    if (submitting) return
    submitMutation()
    const manager = new Auth0ClientManager()
    await manager.changePassword(email)
    onCompleted()
    this.setState({isSent: true})
  }

  render () {
    const {isSent} = this.state
    const {email, submitting} = this.props
    if (isSent) {
      return (
        <MessageSent>
          <div>Message sent to {email}</div>
          <div>Check your inbox!</div>
        </MessageSent>
      )
    }
    return (
      <ForgotButton onClick={this.onClick} waiting={submitting}>
        Forgot your password?
      </ForgotButton>
    )
  }
}

export default withMutationProps(ForgotPasswordOneClick)
