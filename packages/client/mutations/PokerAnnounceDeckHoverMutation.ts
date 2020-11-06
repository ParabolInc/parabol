import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {PokerAnnounceDeckHoverMutation as TPokerAnnounceDeckHoverMutation} from '../__generated__/PokerAnnounceDeckHoverMutation.graphql'

graphql`
  fragment PokerAnnounceDeckHoverMutation_meeting on PokerAnnounceDeckHoverSuccess {
    stage {
      hoveringUsers {
        id
        preferredName
        picture
      }
    }
  }
`

const mutation = graphql`
  mutation PokerAnnounceDeckHoverMutation($meetingId: ID!, $stageId: ID!, $isHover: Boolean!) {
    pokerAnnounceDeckHover(meetingId: $meetingId, stageId: $stageId, isHover: $isHover) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...PokerAnnounceDeckHoverMutation_meeting @relay(mask: false)
    }
  }
`

const PokerAnnounceDeckHoverMutation: StandardMutation<TPokerAnnounceDeckHoverMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TPokerAnnounceDeckHoverMutation>(atmosphere, {
    mutation,
    variables,
    // user doesn't need to know if they are hovering
    onCompleted,
    onError
  })
}

export default PokerAnnounceDeckHoverMutation
