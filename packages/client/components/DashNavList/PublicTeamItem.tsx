import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {PublicTeamItem_team$key} from '../../__generated__/PublicTeamItem_team.graphql'
import {PushInvitationMutation$data} from '../../__generated__/PushInvitationMutation.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import PushInvitationMutation from '../../mutations/PushInvitationMutation'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import SecondaryButton from '../SecondaryButton'

type Props = {
  teamRef: PublicTeamItem_team$key
}

const PublicTeamItem = (props: Props) => {
  const {teamRef} = props
  const [isRequestSent, setIsRequestSent] = useState(false)
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()

  const team = useFragment(
    graphql`
      fragment PublicTeamItem_team on Team {
        id
        name
      }
    `,
    teamRef
  )

  const handleRequestToJoin = (teamId: string) => {
    if (!teamId) return
    SendClientSideEvent(atmosphere, 'Sent request to join from public teams', {teamId})
    PushInvitationMutation(
      atmosphere,
      {teamId},
      {
        onError,
        onCompleted: (res: PushInvitationMutation$data) => {
          if (res.pushInvitation?.error) {
            const error = new Error(res.pushInvitation?.error?.message)
            onError(error)
          } else {
            setIsRequestSent(true)
            onCompleted()
          }
        }
      }
    )
  }

  return (
    <div className='flex items-center justify-between py-2'>
      <span className='text-lg font-semibold'>{team.name}</span>
      <div className='flex items-center'>
        {isRequestSent ? (
          <span className='px-6 py-2.5 text-center font-semibold text-grape-500'>
            Request Sent!
          </span>
        ) : (
          <SecondaryButton onClick={() => handleRequestToJoin(team.id)} size='medium'>
            Request to Join
          </SecondaryButton>
        )}
      </div>
    </div>
  )
}

export default PublicTeamItem
