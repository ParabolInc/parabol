import {useEffect} from 'react'
import {useHistory} from 'react-router'
import useAtmosphere from '../hooks/useAtmosphere'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'

interface Props {
  invitationToken: string
}

const TeamInvitationAccept = (props: Props) => {
  const {invitationToken} = props
  const history = useHistory()
  const atmosphere = useAtmosphere()
  useEffect(() => {
    AcceptTeamInvitationMutation(atmosphere, {invitationToken}, {history})
  })
  return null
}

export default TeamInvitationAccept
