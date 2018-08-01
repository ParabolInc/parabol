/**
 * The Create Account UI.
 *
 * @flow
 */
import type {Credentials, ThirdPartyAuthProvider} from 'universal/types/auth'
import React, {Fragment} from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import CreateAccountEmailPasswordForm from './CreateAccountEmailPasswordForm'
import {withRouter} from 'react-router-dom'
import type {Location} from 'react-router-dom'
import AuthHeader from 'universal/components/AuthHeader/AuthHeader'
import ThirdPartyAuthButton from 'universal/components/ThirdPartyAuthButton/ThirdPartyAuthButton'
import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator'
import ErrorAlert from 'universal/components/ErrorAlert/ErrorAlert'
import {SIGNIN_LABEL, SIGNIN_SLUG, CREATE_ACCOUNT_LABEL} from 'universal/utils/constants'

type Props = {
  authProviders: Array<ThirdPartyAuthProvider>,
  error: ?string,
  getHandlerForThirdPartyAuth: (auth0Connection: string) => () => void,
  handleValidCreateAccountCredentials: (Credentials) => Promise<any>,
  location: Location,
  isSubmitting: boolean
}

const purple = {
  color: appTheme.brand.primary.purple
}

const linkStyles = {
  ...purple,
  textDecoration: 'underline'
}

const A = styled('a')({
  ...linkStyles,
  ':hover': linkStyles,
  marginTop: '1rem',
  textAlign: 'center'
})

const PrivacyFooter = styled('div')({
  color: ui.hintColor,
  fontSize: ui.hintFontSize,
  marginTop: '1rem',
  textAlign: 'center'
})

const CreateAccount = (props: Props) => {
  const {location} = props
  const relativeUrl = `/${SIGNIN_SLUG}${location.search}`
  return (
    <Fragment>
      <AuthHeader
        heading={CREATE_ACCOUNT_LABEL}
        secondaryAction={{relativeUrl, displayName: SIGNIN_LABEL}}
      />
      {props.authProviders.map((provider) => (
        <ThirdPartyAuthButton
          key={provider.displayName}
          provider={provider}
          waiting={props.isSubmitting}
          handleClick={props.getHandlerForThirdPartyAuth(provider.auth0Connection)}
        />
      ))}
      <HorizontalSeparator margin='1rem 0 0' text='or' />
      {props.error && <ErrorAlert message={props.error} />}
      <CreateAccountEmailPasswordForm onSubmit={props.handleValidCreateAccountCredentials} />
      <PrivacyFooter>
        {'By creating an account, you agree to our '}
        <A
          href='https://www.parabol.co/privacy'
          target='_blank'
          rel='noopener noreferrer'
          title='Privacy Policy'
        >
          {'Privacy Policy'}
        </A>.
      </PrivacyFooter>
    </Fragment>
  )
}

export default withRouter(CreateAccount)
