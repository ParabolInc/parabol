import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useJoinTeamHealthCheckMutation as TJoinTeamHealthCheckMutation} from '../__generated__/useJoinTeamHealthCheckMutation.graphql'

// joins the team's check from inside a retro. Until now the viewer had no membership to read, so the
// payload brings back everything the retro shows of the check
const mutation = graphql`
  mutation useJoinTeamHealthCheckMutation($meetingId: ID!) {
    joinMeeting(meetingId: $meetingId) {
      meeting {
        id
        ...RetroTeamHealthCheck_teamHealthMeeting
        ...TeamHealthSidebarQuestionSection_meeting
      }
    }
  }
`

const useJoinTeamHealthCheckMutation = () => {
  const [commit, submitting] = useMutation<TJoinTeamHealthCheckMutation>(mutation)
  const execute = (config: UseMutationConfig<TJoinTeamHealthCheckMutation>) => {
    return commit({...config})
  }
  return [execute, submitting] as const
}

export default useJoinTeamHealthCheckMutation
