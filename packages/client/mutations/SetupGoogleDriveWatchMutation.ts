import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {SetupGoogleDriveWatchMutation as TSetupGoogleDriveWatchMutation} from '../__generated__/SetupGoogleDriveWatchMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

const mutation = graphql`
  mutation SetupGoogleDriveWatchMutation($teamId: ID!) {
    setupGoogleDriveWatch(teamId: $teamId) {
      integrations {
        id
        gdrive {
          isActive
          watchExpiresAt
        }
      }
    }
  }
`

const SetupGoogleDriveWatchMutation: StandardMutation<TSetupGoogleDriveWatchMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetupGoogleDriveWatchMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted
  })
}

export default SetupGoogleDriveWatchMutation
