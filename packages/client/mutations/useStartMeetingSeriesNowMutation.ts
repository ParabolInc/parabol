import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useStartMeetingSeriesNowMutation as TStartMeetingSeriesNowMutation} from '../__generated__/useStartMeetingSeriesNowMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

const mutation = graphql`
  mutation useStartMeetingSeriesNowMutation($meetingSeriesId: ID!) {
    startMeetingSeriesNow(meetingSeriesId: $meetingSeriesId) {
      meeting {
        id
      }
      team {
        ...MeetingsDashActiveMeetings @relay(mask: false)
      }
    }
  }
`

const useStartMeetingSeriesNowMutation = () => {
  const [commit, submitting] = useMutation<TStartMeetingSeriesNowMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TStartMeetingSeriesNowMutation>) => {
    return commit({
      ...config,
      onError: (error) => {
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: error.message,
          autoDismiss: 5,
          key: 'startMeetingSeriesNowError'
        })
        config.onError?.(error)
      }
    })
  }
  return [execute, submitting] as const
}

export default useStartMeetingSeriesNowMutation
