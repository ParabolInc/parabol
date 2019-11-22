/**
 * The password reset page. Allows the user to reset their password via email.
 *
 */
import React, {Component, Fragment} from 'react'
import styled from '@emotion/styled'
import EmailInputField from '../EmailInputField'
import PlainButton from '../PlainButton/PlainButton'
import PrimaryButton from '../PrimaryButton'
import withMutationProps, {WithMutationProps} from '../../utils/relay/withMutationProps'
import {emailRegex} from '../../validation/regex'
import Auth0ClientManager from '../../utils/Auth0ClientManager'
import Legitity from '../../validation/Legitity'
import AuthenticationDialog from '../AuthenticationDialog'
import {GotoAuthPage} from '../GenericAuthentication'
import DialogTitle from '../DialogTitle'
import {PALETTE} from '../../styles/paletteV2'
import IconLabel from '../IconLabel'

interface State {
  isSent: boolean
  email: string
}

interface Props extends WithMutationProps {
  email?: string
  gotoPage: GotoAuthPage
}

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column'
})

const P = styled('p')({
  fontSize: 14,
  lineHeight: 1.5,
  margin: '16px 0',
  textAlign: 'center'
})

const Container = styled('div')({
  margin: '0 auto',
  maxWidth: 240,
  width: '100%'
})

const LinkButton = styled(PlainButton)({
  color: PALETTE.LINK_BLUE,
  ':hover': {
    color: PALETTE.LINK_BLUE,
    textDecoration: 'underline'
  }
})

const SubmitButton = styled(PrimaryButton)({
  marginTop: 16
})

const StyledPrimaryButton = styled(PrimaryButton)({
  margin: '16px auto 0',
  width: 240
})

const BrandedLink = styled(PlainButton)({
  color: PALETTE.LINK_BLUE,
  ':hover,:focus': {
    color: PALETTE.LINK_BLUE,
    textDecoration: 'underline'
  }
})

const DialogSubTitle = styled('div')({
  fontSize: 14,
  fontWeight: 400,
  lineHeight: 1.5,
  paddingTop: 16,
  paddingBottom: 24
})

class ResetPasswordPage extends Component<Props, State> {
  constructor(props) {
    super(props)
    const params = new URLSearchParams(window.location.search)
    const email = params.get('email')
    this.state = {
      isSent: false,
      email: props.email || email || ''
    }
  }

  validateEmail = (email) => {
    return new Legitity(email)
      .trim()
      .required('Please enter an email address')
      .matches(emailRegex, 'Please enter a valid email address')
  }

  onBlur = () => {
    this.props.setDirty()
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {error, onCompleted, onError} = this.props
    const email = e.target.value

    this.setState({
      email
    })

    const res = this.validateEmail(email)
    if (res.error) {
      onError(res.error)
    } else if (error) {
      onCompleted()
    }
  }

  onSubmit = async (e) => {
    e.preventDefault()
    const {submitMutation, submitting, onCompleted} = this.props
    const {email} = this.state
    if (submitting) return
    submitMutation()
    const manager = new Auth0ClientManager()
    await manager.changePassword(email)
    onCompleted()
    this.setState({isSent: true})
  }

  resetState = () => {
    const {onCompleted} = this.props
    onCompleted()
    this.setState({
      isSent: false
    })
  }

  render() {
    const {dirty, error, submitting, gotoPage} = this.props
    const {isSent, email} = this.state
    const gotoSignIn = () => {
      gotoPage('signin', location.search)
    }
    return (
      <AuthenticationDialog>
        <DialogTitle>{isSent ? 'You’re all set!' : 'Forgot your password?'}</DialogTitle>
        {!isSent && (
          <DialogSubTitle>
            <span>{isSent ? '' : 'Remember it? '}</span>
            <BrandedLink onClick={gotoSignIn}>{isSent ? '' : 'Sign in with password'}</BrandedLink>
          </DialogSubTitle>
        )}
        <Container>
          {isSent ? (
            <Fragment>
              <P>{'We’ve sent you an email with password recovery instructions.'}</P>
              <P>
                {'Didn’t get it? Check your spam folder, or '}
                <LinkButton onClick={this.resetState}>click here</LinkButton>
                {' to try again.'}
              </P>
              <StyledPrimaryButton onClick={gotoSignIn} size='medium'>
                <IconLabel icon='arrow_back' label='Back to Sign In' />
              </StyledPrimaryButton>
            </Fragment>
          ) : (
            <Fragment>
              <P>
                {
                  'Confirm your email address, and we’ll send you an email with password recovery instructions.'
                }
              </P>
              <Form onSubmit={this.onSubmit}>
                <EmailInputField
                  dirty={!!dirty}
                  error={error as string}
                  value={email}
                  onChange={this.onChange}
                  onBlur={this.onBlur}
                />
                <SubmitButton size='medium' waiting={submitting}>
                  {'Send Email'}
                </SubmitButton>
              </Form>
            </Fragment>
          )}
        </Container>
      </AuthenticationDialog>
    )
  }
}

export default withMutationProps(ResetPasswordPage)
