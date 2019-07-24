import {useEffect} from 'react'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'
import useRouter from '../hooks/useRouter'
import useAtmosphere from '../hooks/useAtmosphere'

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
