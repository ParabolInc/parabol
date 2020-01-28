import {useEffect} from 'react'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'
import useRouter from '../hooks/useRouter'
import useAtmosphere from '../hooks/useAtmosphere'

interface Props {
  invitationToken: string
}

const TeamInvitationAccept = (props: Props) => {
  const {invitationToken} = props
  const {history} = useRouter()
  const atmosphere = useAtmosphere()
  useEffect(() => {
    AcceptTeamInvitationMutation(atmosphere, {invitationToken}, {history})
  })
  return null
}

export default TeamInvitationAccept
