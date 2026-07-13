import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useStartTeamHealthMutation as TStartTeamHealthMutation} from '../__generated__/useStartTeamHealthMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

graphql`
  fragment useStartTeamHealthMutation_success on StartTeamHealthSuccess {
    meetings {
      id
      teamId
    }
    teams {
      ...MeetingsDashActiveMeetings @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation useStartTeamHealthMutation($teamIds: [ID!]!, $templateId: ID!) {
    startTeamHealth(teamIds: $teamIds, templateId: $templateId) {
      ...useStartTeamHealthMutation_success @relay(mask: false)
    }
  }
`

const useStartTeamHealthMutation = () => {
  const [commit, submitting] = useMutation<TStartTeamHealthMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TStartTeamHealthMutation>) => {
    return commit({
      ...config,
      onError: (error) => {
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: error.message,
          autoDismiss: 5,
          key: 'startTeamHealthError'
        })
        config.onError?.(error)
      }
    })
  }
  return [execute, submitting] as const
}

export default useStartTeamHealthMutation
