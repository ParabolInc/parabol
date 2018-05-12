/**
 * The sign-in UI.
 *
 * @flow
 */
import type {ThirdPartyAuthProvider, Credentials} from 'universal/types/auth'
import React, {Fragment} from 'react'
import SignInEmailPasswordForm from './SignInEmailPasswordForm'
import {withRouter} from 'react-router-dom'
import type {Location} from 'react-router-dom'
import AuthHeader from 'universal/components/AuthHeader/AuthHeader'
import ThirdPartyAuthButton from 'universal/components/ThirdPartyAuthButton/ThirdPartyAuthButton'
import HorizontalSeparator from 'universal/components/HorizontalSeparator/HorizontalSeparator'
import ErrorAlert from 'universal/components/ErrorAlert/ErrorAlert'

type Props = {
  authProviders: Array<ThirdPartyAuthProvider>,
  getHandlerForThirdPartyAuth: (auth0Connection: string) => () => void,
  handleSubmitCredentials: (Credentials) => Promise<any>,
  location: Location,
  error: ?string,
  isSubmitting: boolean
}

const SignIn = (props: Props) => {
  const {location} = props
  const relativeUrl = `/signup${location.search}`
  return (
    <Fragment>
      <AuthHeader heading='Sign In' secondaryAction={{relativeUrl, displayName: 'Sign Up'}} />
      {props.authProviders.map((provider) => (
        <ThirdPartyAuthButton
          action='Sign in'
          waiting={props.isSubmitting}
          key={provider.displayName}
          provider={provider}
          handleClick={props.getHandlerForThirdPartyAuth(provider.auth0Connection)}
        />
      ))}
      <HorizontalSeparator margin='1rem 0 0' text='or' />
      {props.error && <ErrorAlert message={props.error} />}
      <SignInEmailPasswordForm onSubmit={props.handleSubmitCredentials} />
    </Fragment>
  )
}

export default withRouter(SignIn)
