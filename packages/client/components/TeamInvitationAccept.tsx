import {useNavigate} from '@tanstack/react-router'
import {useEffect, useRef} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'

interface Props {
  invitationToken: string
}

const TeamInvitationAccept = (props: Props) => {
  const {invitationToken} = props
  const navigate = useNavigate()
  const atmosphere = useAtmosphere()
  // React can run this effect again without a remount (StrictMode does on mount), and the server rejects an accept that overlaps the first
  const acceptedTokenRef = useRef<string | null>(null)
  useEffect(() => {
    if (acceptedTokenRef.current === invitationToken) return
    acceptedTokenRef.current = invitationToken
    AcceptTeamInvitationMutation(atmosphere, {invitationToken}, {navigate})
  }, [invitationToken])
  return null
}

export default TeamInvitationAccept
