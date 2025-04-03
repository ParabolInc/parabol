import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {PublicTeamItem_team$key} from '../../__generated__/PublicTeamItem_team.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import JoinTeamMutation from '../../mutations/JoinTeamMutation'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import SecondaryButton from '../SecondaryButton'

type Props = {
  teamRef: PublicTeamItem_team$key
}

const PublicTeamItem = (props: Props) => {
  const {teamRef} = props
  const [isJoined, setIsJoined] = useState(false)
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

  const handleJoinTeam = (teamId: string) => {
    if (!teamId) return
    SendClientSideEvent(atmosphere, 'Joined public team', {teamId})
    JoinTeamMutation(
      atmosphere,
      {teamId},
      {
        onError,
        onCompleted: (res) => {
          if (res.joinTeam?.error) {
            const error = new Error(res.joinTeam.error.message)
            onError(error)
          } else {
            setIsJoined(true)
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
        {isJoined ? (
          <span className='px-6 py-2.5 text-center font-semibold text-grape-500'>Joined!</span>
        ) : (
          <SecondaryButton onClick={() => handleJoinTeam(team.id)} size='medium'>
            Join
          </SecondaryButton>
        )}
      </div>
    </div>
  )
}

export default PublicTeamItem
