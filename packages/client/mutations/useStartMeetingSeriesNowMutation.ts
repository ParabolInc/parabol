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
    const showError = (message: string) => {
      atmosphere.eventEmitter.emit('addSnackbar', {
        message,
        autoDismiss: 5,
        key: 'startMeetingSeriesNowError'
      })
    }
    return commit({
      ...config,
      // The server throws for every failure mode, and Atmosphere delivers a thrown GraphQLError
      // here rather than to onError
      onCompleted: (res, errors) => {
        const error = errors?.[0]
        if (error) {
          showError(error.message)
          return
        }
        config.onCompleted?.(res, errors)
      },
      onError: (error) => {
        showError(error.message)
        config.onError?.(error)
      }
    })
  }
  return [execute, submitting] as const
}

export default useStartMeetingSeriesNowMutation
