import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useSetTeamHealthSpectateMutation as TSetTeamHealthSpectateMutation} from '../__generated__/useSetTeamHealthSpectateMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

// selected by both the mutation payload and MeetingSubscription. Relay merges by meeting member id
graphql`
  fragment useSetTeamHealthSpectateMutation_meeting on SetTeamHealthSpectateSuccess {
    meetingMember {
      id
      isSpectating
    }
  }
`

const mutation = graphql`
  mutation useSetTeamHealthSpectateMutation($meetingId: ID!, $isSpectating: Boolean!) {
    setTeamHealthSpectate(meetingId: $meetingId, isSpectating: $isSpectating) {
      ...useSetTeamHealthSpectateMutation_meeting @relay(mask: false)
    }
  }
`

const useSetTeamHealthSpectateMutation = () => {
  const [commit, submitting] = useMutation<TSetTeamHealthSpectateMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TSetTeamHealthSpectateMutation>) => {
    return commit({
      onError: snackOnError(atmosphere, 'setTeamHealthSpectateError'),
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useSetTeamHealthSpectateMutation
