import {PromoteFacilitatorMutationResponse} from '__generated__/PromoteFacilitatorMutation.graphql'
import {PromoteFacilitatorMutation_team} from '__generated__/PromoteFacilitatorMutation_team.graphql'
import {commitMutation, graphql} from 'react-relay'

graphql`
  fragment PromoteFacilitatorMutation_team on PromoteFacilitatorPayload {
    team {
      activeFacilitator
    }
    disconnectedFacilitator {
      preferredName
    }
    newFacilitator {
      preferredName
      userId
    }
  }
`

const mutation = graphql`
  mutation PromoteFacilitatorMutation($facilitatorId: ID!, $disconnectedFacilitatorId: ID) {
    promoteFacilitator(
      facilitatorId: $facilitatorId
      disconnectedFacilitatorId: $disconnectedFacilitatorId
    ) {
      error {
        message
      }
      ...PromoteFacilitatorMutation_team @relay(mask: false)
    }
  }
`

const popFacilitatorDisconnectedToast = (
  payload: PromoteFacilitatorMutation_team,
  {atmosphere}
) => {
  if (!payload) return
  const disconnectedFacilitatorName =
    payload.disconnectedFacilitator && payload.disconnectedFacilitator.preferredName
  // Don't toast changes, only disconnects
  if (!disconnectedFacilitatorName || !payload.newFacilitator) return

  const newFacilitatorName = payload.newFacilitator.preferredName
  const newFacilitatorUserId = payload.newFacilitator.userId
  const facilitatorIntro =
    atmosphere.viewerId === newFacilitatorUserId ? 'You are' : `${newFacilitatorName} is`
  atmosphere.eventEmitter.emit('addToast', {
    level: 'info',
    title: `${disconnectedFacilitatorName} Disconnected!`,
    message: `${facilitatorIntro} the new facilitator`
  })
}

export const promoteFacilitatorTeamOnNext = (payload, {atmosphere}) => {
  popFacilitatorDisconnectedToast(payload, {atmosphere})
}

const PromoteFacilitatorMutation = (atmosphere, variables, _context, onError, onCompleted) => {
  const {facilitatorId} = variables
  return commitMutation(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const [, teamId] = facilitatorId.split('::')
      const team = store.get(teamId)
      if (!team) return
      team.setValue(facilitatorId, 'activeFacilitator')
    },
    onCompleted: (res: PromoteFacilitatorMutationResponse, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      const payload = res.promoteFacilitator
      if (payload) {
        popFacilitatorDisconnectedToast(payload as any, {atmosphere})
      }
    },
    onError
  })
}

export default PromoteFacilitatorMutation
