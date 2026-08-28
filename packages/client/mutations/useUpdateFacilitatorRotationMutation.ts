import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {RecordProxy} from 'relay-runtime'
import type {useUpdateFacilitatorRotationMutation as TUpdateFacilitatorRotationMutation} from '../__generated__/useUpdateFacilitatorRotationMutation.graphql'
import type {useUpdateFacilitatorRotationMutation_meeting$data} from '../__generated__/useUpdateFacilitatorRotationMutation_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import type {OnNextHandler} from '../types/relayMutations'

graphql`
  fragment useUpdateFacilitatorRotationMutation_team on UpdateFacilitatorRotationSuccess {
    team {
      id
      autoAssignFacilitator
      facilitatorRotation {
        id
        userId
        user {
          id
          preferredName
          picture
        }
      }
    }
  }
`

graphql`
  fragment useUpdateFacilitatorRotationMutation_meeting on UpdateFacilitatorRotationSuccess {
    meeting {
      facilitatorUserId
      facilitator {
        user {
          id
          preferredName
        }
      }
    }
    facilitatorStage {
      readyUserIds
      isViewerReady
    }
  }
`

const mutation = graphql`
  mutation useUpdateFacilitatorRotationMutation(
    $teamId: ID!
    $meetingId: ID
    $userIds: [ID!]
    $autoAssignFacilitator: Boolean
  ) {
    updateFacilitatorRotation(
      teamId: $teamId
      meetingId: $meetingId
      userIds: $userIds
      autoAssignFacilitator: $autoAssignFacilitator
    ) {
      ...useUpdateFacilitatorRotationMutation_team @relay(mask: false)
      ...useUpdateFacilitatorRotationMutation_meeting @relay(mask: false)
    }
  }
`

export const updateFacilitatorRotationMeetingOnNext: OnNextHandler<
  useUpdateFacilitatorRotationMutation_meeting$data
> = (payload, {atmosphere}) => {
  const {viewerId} = atmosphere
  const {meeting} = payload
  // meeting is only sent when the head of the queue changed, i.e. on an actual handoff
  if (!meeting) return
  const {
    facilitator: {user: facilitatorUser}
  } = meeting
  const {preferredName, id: newFacilitatorUserId} = facilitatorUser
  const isSelf = newFacilitatorUserId === viewerId
  atmosphere.eventEmitter.emit('removeSnackbar', (snack) => snack.key.startsWith('newFacilitator'))
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 5,
    key: `newFacilitator:${newFacilitatorUserId}`,
    message: isSelf ? 'You are the new facilitator' : `${preferredName} is the new facilitator`
  })
}

const useUpdateFacilitatorRotationMutation = () => {
  const [commit, submitting] = useMutation<TUpdateFacilitatorRotationMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TUpdateFacilitatorRotationMutation>) => {
    const {teamId, meetingId, userIds, autoAssignFacilitator} = config.variables
    return commit({
      // drag feedback must be instant; the server response reconciles any drift
      optimisticUpdater: (store) => {
        const team = store.get(teamId)
        if (!team) return
        if (autoAssignFacilitator !== null && autoAssignFacilitator !== undefined) {
          team.setValue(autoAssignFacilitator, 'autoAssignFacilitator')
        }
        if (!userIds) return
        const rotation = team.getLinkedRecords('facilitatorRotation') ?? []
        const nextRotation = userIds
          .map((userId) => rotation.find((teamMember) => teamMember?.getValue('userId') === userId))
          .filter((teamMember): teamMember is RecordProxy => !!teamMember)
        team.setLinkedRecords(nextRotation, 'facilitatorRotation')
        // whoever heads the queue facilitates, so a new head is a handoff
        const meeting = meetingId ? store.get(meetingId) : null
        if (meeting && userIds[0]) meeting.setValue(userIds[0], 'facilitatorUserId')
      },
      ...config,
      onCompleted: (res, errors) => {
        config.onCompleted?.(res, errors)
        updateFacilitatorRotationMeetingOnNext(res.updateFacilitatorRotation, {atmosphere})
      }
    })
  }
  return [execute, submitting] as const
}

export default useUpdateFacilitatorRotationMutation
