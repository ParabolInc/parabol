import {useEffect} from 'react'
import AcceptTeamInvitationMutation from 'universal/mutations/AcceptTeamInvitationMutation'
import useRouter from 'universal/hooks/useRouter'
import useAtmosphere from 'universal/hooks/useAtmosphere'

interface Props {
  invitationToken: string
  teamId: string
}

const TeamInvitationAccept = (props: Props) => {
  const {invitationToken, teamId} = props
  const {history} = useRouter()
  const onCompleted = () => {
    history.replace(`/team/${teamId}`)
  }
  const atmosphere = useAtmosphere()
  useEffect(() => {
    AcceptTeamInvitationMutation(atmosphere, {invitationToken}, {history, onCompleted})
  })
  return null
}

export default TeamInvitationAccept
