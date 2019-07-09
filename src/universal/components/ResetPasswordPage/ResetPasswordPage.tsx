/**
 * The password reset page. Allows the user to reset their password via email.
 *
 */
import React, {Component, Fragment} from 'react'
import styled from 'react-emotion'
import EmailInputField from 'universal/components/EmailInputField'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import PrimaryButton from 'universal/components/PrimaryButton'
import appTheme from 'universal/styles/theme/appTheme'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {emailRegex} from 'universal/validation/regex'
import auth0ChangePassword from 'universal/utils/auth0ChangePassword'
import Legitity from 'universal/validation/Legitity'
import AuthenticationDialog from '../AuthenticationDialog'
import {GotoAuathPage} from 'universal/components/GenericAuthentication'
import DialogTitle from 'universal/components/DialogTitle'
import {PALETTE} from 'universal/styles/paletteV2'

type State = {
  isSent: boolean
  email: string
}

interface Props extends WithMutationProps {
  email?: string
  gotoPage: GotoAuathPage
}

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column'
})

const P = styled('p')({
  fontSize: '.875rem',
  lineHeight: 1.5,
  margin: '1rem 0',
  textAlign: 'center'
})

const Container = styled('div')({
  margin: '0 auto',
  maxWidth: 240,
  width: '100%'
})

const LinkButton = styled(PlainButton)({
  color: appTheme.brand.secondary.blue,
  ':hover': {
    color: appTheme.brand.secondary.blue,
    textDecoration: 'underline'
  }
})

const SubmitButton = styled(PrimaryButton)({
  marginTop: '1rem'
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
  constructor (props) {
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
    const {submitMutation, submitting, onError, onCompleted} = this.props
    const {email} = this.state
    if (submitting) return
    submitMutation()
    try {
      await auth0ChangePassword(email)
    } catch (e) {
      onError(e)
      return
    }
    onCompleted()
    this.setState({
      isSent: true
    })
  }

  resetState = () => {
    const {onCompleted} = this.props
    onCompleted()
    this.setState({
      isSent: false
    })
  }

  render () {
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
