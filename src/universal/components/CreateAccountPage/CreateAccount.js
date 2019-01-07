/**
 * The Create Account UI.
 *
 * @flow
 */
import type {Credentials, ThirdPartyAuthProvider} from 'universal/types/auth'
import React from 'react'
import CreateAccountEmailPasswordForm from './CreateAccountEmailPasswordForm'
import {withRouter} from 'react-router-dom'
import type {Location} from 'react-router-dom'
import AuthDialog from 'universal/components/AuthDialog'
import AuthHeader from 'universal/components/AuthHeader/AuthHeader'
import AuthPrivacyFooter from 'universal/components/AuthPrivacyFooter'
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

const CreateAccount = (props: Props) => {
  const {location} = props
  const relativeUrl = `/${SIGNIN_SLUG}${location.search}`
  return (
    <AuthDialog>
      <AuthHeader
        heading={CREATE_ACCOUNT_LABEL}
        secondaryAction={{
          relativeUrl,
          displayName: SIGNIN_LABEL,
          actionCopy: 'Already have an account?'
        }}
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
      <AuthPrivacyFooter />
    </AuthDialog>
  )
}

export default withRouter(CreateAccount)
