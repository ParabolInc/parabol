import {useEffect} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import useNavigate from '../hooks/useNavigate'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'

interface Props {
  invitationToken: string
}

const TeamInvitationAccept = (props: Props) => {
  const {invitationToken} = props
  const navigate = useNavigate()
  const atmosphere = useAtmosphere()
  useEffect(() => {
    AcceptTeamInvitationMutation(atmosphere, {invitationToken}, {navigate})
  })
  return null
}

export default TeamInvitationAccept
