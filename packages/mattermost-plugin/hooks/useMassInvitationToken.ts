import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery, useMutation} from 'react-relay'

import {Threshold} from 'parabol-client/types/constEnums'
import {useCallback} from 'react'
import {useMassInvitationTokenMutation} from '../__generated__/useMassInvitationTokenMutation.graphql'
import {useMassInvitationTokenQuery} from '../__generated__/useMassInvitationTokenQuery.graphql'
import {mutationResult} from '../utils/mutationResult'

const FIVE_MINUTES = 1000 * 60 * 5
const acceptableLifeLeft = Threshold.MASS_INVITATION_TOKEN_LIFESPAN - FIVE_MINUTES

const useMassInvitationToken = ({teamId, meetingId}: {teamId?: string; meetingId?: string}) => {
  const [updateToken] = useMutation<useMassInvitationTokenMutation>(graphql`
    mutation useMassInvitationTokenMutation($teamId: ID!, $meetingId: ID) {
      createMassInvitation(teamId: $teamId, meetingId: $meetingId, voidOld: false) {
        ... on CreateMassInvitationSuccess {
          team {
            id
            massInvitation {
              id
              expiration
              meetingId
            }
          }
        }
      }
    }
  `)

  const data = useLazyLoadQuery<useMassInvitationTokenQuery>(
    graphql`
      query useMassInvitationTokenQuery($noData: Boolean!, $teamId: ID!, $meetingId: ID) {
        viewer @skip(if: $noData) {
          team(teamId: $teamId) {
            id
            massInvitation(meetingId: $meetingId) {
              id
              expiration
              meetingId
            }
          }
        }
      }
    `,
    {
      noData: !teamId,
      teamId: teamId ?? '',
      meetingId
    }
  )

  const team = data.viewer?.team

  const getToken = useCallback(async () => {
    if (!team || !teamId) {
      return
    }
    const {massInvitation} = team
    const {expiration, id: token} = massInvitation!
    const tokenLifeRemaining = new Date(expiration).getTime() - Date.now()
    const isTokenValid = tokenLifeRemaining > acceptableLifeLeft

    if (isTokenValid) {
      return token
    }

    const ret = await mutationResult(updateToken, {
      variables: {
        teamId,
        meetingId
      }
    })

    return ret.createMassInvitation?.team?.massInvitation?.id
  }, [team, meetingId])

  return getToken
}

export default useMassInvitationToken
