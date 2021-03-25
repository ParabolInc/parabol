import React, {useEffect, useState} from 'react'
import DialogTitle from './DialogTitle'
import DialogContent from './DialogContent'
import StyledError from './StyledError'
import InviteDialog from './InviteDialog'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import TeamInvitationMeetingAbstract from './TeamInvitationMeetingAbstract'

const SAMLRedirect = () => {
  const [error, setError] = useState('')
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const error = params.get('error')
    if (window.opener) {
      // SP-initiated
      window.opener.postMessage({token, error}, window.location.origin)
    } else {
      // IdP-initiated
      if (!token) {
        setError(error || 'Error logging in')
      } else {
        atmosphere.setAuthToken(token)
        history.replace('/meetings')
      }
    }
  }, [])

  if (error) {
    const errors = error.split('|')
    return (
      <TeamInvitationMeetingAbstract>
        <InviteDialog>
          <DialogTitle>SSO Login</DialogTitle>
          <DialogContent>
            {errors.map((error, idx) => (
              <StyledError key={idx}>{error}</StyledError>
            ))}
          </DialogContent>
        </InviteDialog>
      </TeamInvitationMeetingAbstract>
    )
  }
  return null
}

export default SAMLRedirect
