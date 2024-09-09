import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {InvalidateSessionsMutation as TInvalidateSessionsMutation} from '../__generated__/InvalidateSessionsMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment InvalidateSessionsMutation_notification on InvalidateSessionsPayload {
    # we won't really get it, but we gotta ask for something (and __typename results in a dupe req bug)
    authToken
  }
`

const mutation = graphql`
  mutation InvalidateSessionsMutation {
    invalidateSessions {
      error {
        message
      }
      authToken
      ...InvalidateSessionsMutation_notification @relay(mask: false)
    }
  }
`

const InvalidateSessionsMutation: StandardMutation<TInvalidateSessionsMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TInvalidateSessionsMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      const {invalidateSessions} = res
      const {authToken} = invalidateSessions
      if (authToken) {
        atmosphere.setAuthToken(authToken)
      }
    },
    onError
  })
}

export default InvalidateSessionsMutation
