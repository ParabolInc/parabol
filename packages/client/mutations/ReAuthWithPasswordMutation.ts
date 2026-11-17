import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {ReAuthWithPasswordMutation as TReAuthWithPasswordMutation} from '../__generated__/ReAuthWithPasswordMutation.graphql'
import type Atmosphere from '../Atmosphere'
import getMutationError from '../utils/relay/getMutationError'

const mutation = graphql`
  mutation ReAuthWithPasswordMutation($email: ID!, $password: String!) {
    loginWithPassword(email: $email, password: $password) {
      userErrors {
        message
      }
      userId
    }
  }
`

const ReAuthWithPasswordMutation = (
  atmosphere: Atmosphere,
  variables: {email: string; password: string},
  onCompleted: (error?: string) => void
) => {
  return commitMutation<TReAuthWithPasswordMutation>(atmosphere, {
    mutation,
    variables,
    onError: (err) => onCompleted(getMutationError(err).message),
    onCompleted: (res, errors) => {
      const [userError] = res.loginWithPassword.userErrors
      if (userError) {
        onCompleted(userError.message)
      } else if (errors?.length) {
        onCompleted(errors[0]?.message ?? 'Unknown error')
      } else {
        onCompleted()
      }
    }
  })
}

export default ReAuthWithPasswordMutation
