import {commitMutation} from 'react-relay'
import PromoteFacilitatorMutation from 'universal/mutations/PromoteFacilitatorMutation'

graphql`
  fragment RequestFacilitatorMutation_team on RequestFacilitatorPayload {
    requestor {
      id
      preferredName
    }
  }
`

const mutation = graphql`
  mutation RequestFacilitatorMutation($teamId: ID!) {
    requestFacilitator(teamId: $teamId) {
      error {
        message
      }
      ...RequestFacilitatorMutation_team @relay(mask: false)
    }
  }
`

export const requestFacilitatorTeamOnNext = (payload, {atmosphere}) => {
  if (!payload || !payload.requestor) return
  const {id: requestorId, preferredName: requestorName} = payload.requestor
  atmosphere.eventEmitter.emit('addToast', {
    level: 'info',
    title: `${requestorName} wants to facilitate`,
    message: 'Tap ‘Promote’ to hand over the reins',
    autoDismiss: 0,
    action: {
      label: 'Promote',
      callback: () => {
        PromoteFacilitatorMutation(atmosphere, {facilitatorId: requestorId}, {})
      }
    }
  })
}

const RequestFacilitatorMutation = (environment, teamId) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamId}
  })
}

export default RequestFacilitatorMutation
