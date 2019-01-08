/**
 * The password reset page. Allows the user to reset their password via email.
 *
 * @flow
 */
import promisify from 'es6-promisify'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {AUTH0_DB_CONNECTION, SIGNIN_SLUG} from 'universal/utils/constants'
import getWebAuth from 'universal/utils/getWebAuth'
import PasswordReset from './ResetPassword'
import AuthPage from 'universal/components/AuthPage/AuthPage'
import AuthDialog from 'universal/components/AuthDialog'
import AuthHeader from 'universal/components/AuthHeader/AuthHeader'

type Props = {}

type State = {
  error: ?string,
  emailSent: boolean
}

const StyledDialog = styled(AuthDialog)({
  maxWidth: '19rem'
})

export default class PasswordResetPage extends Component<Props, State> {
  state = {
    error: null,
    emailSent: false
  }

  webAuth = getWebAuth()

  auth0ChangePassword = ({email}: {email: string}): Promise<void> => {
    const changePassword = promisify(this.webAuth.changePassword, this.webAuth)
    return changePassword({
      connection: AUTH0_DB_CONNECTION,
      email
    })
  }

  handleSubmitResetPassword = async ({email}: {email: string}): Promise<void> => {
    try {
      await this.auth0ChangePassword({email})
      this.setState({emailSent: true, error: null})
    } catch (error) {
      this.setState({error: error.message})
    }
  }

  resetState = () => {
    this.setState({error: null, emailSent: false})
  }

  render () {
    const {error, emailSent} = this.state
    return (
      <AuthPage title='Reset Password | Parabol'>
        <StyledDialog>
          <AuthHeader
            heading='Forgot your password?'
            secondaryAction={{relativeUrl: `/${SIGNIN_SLUG}`, displayName: 'Sign in with password'}}
          />
          <PasswordReset
            error={error}
            emailSent={emailSent}
            handleSubmitResetPassword={this.handleSubmitResetPassword}
            tryAgain={this.resetState}
          />
        </StyledDialog>
      </AuthPage>
    )
  }
}
