import graphql from 'babel-plugin-relay/macro'
import {ConnectionHandler} from 'react-relay'
import {UserInteractionTeamUpdater_team$data} from '~/__generated__/UserInteractionTeamUpdater_team.graphql'
import UserInteractionId from '~/shared/gqlIds/UserInteractionId'
import {SharedUpdater} from '../../types/relayMutations'
import safePutNodeInConn from '../../mutations/handlers/safePutNodeInConn'

graphql`
  fragment UserInteractionTeamUpdater_team on UserInteractionSuccess {
    userInteractions {
      id
      sender {
        id
        preferredName
        picture
      }
      receiver {
        id
        preferredName
        picture
      }
      emoji
      createdAt
    }
  }
`

export const userInteractionTeamUpdater: SharedUpdater<UserInteractionTeamUpdater_team$data> = (
  payload,
  {store}
) => {
  const userInteractions = payload.getLinkedRecords('userInteractions')
  userInteractions.forEach((userInteraction) => {
    const id = userInteraction.getValue('id')
    const {teamId} = UserInteractionId.split(id)
    const team = store.get(teamId)
    if (!team) return
    const interactionConn = ConnectionHandler.getConnection(
      team,
      'TeamInteractions_userInteractions'
    )
    if (!interactionConn) return
    safePutNodeInConn(interactionConn, userInteraction, store, 'createdAt', true)
  })
}
