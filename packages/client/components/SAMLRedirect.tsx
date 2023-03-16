import React, {useEffect, useState} from 'react'
import ReactGA from 'react-ga4'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InviteDialog from './InviteDialog'
import StyledError from './StyledError'
import TeamInvitationMeetingAbstract from './TeamInvitationMeetingAbstract'

const SAMLRedirect = () => {
  const [error, setError] = useState('')
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const error = params.get('error')
    const userId = params.get('userId')
    const isNewUser = params.get('isNewUser') === 'true'
    const isPatient0 = params.get('isPatient0') === 'true'
    if (isNewUser && !error) {
      ReactGA.event('sign_up', {
        userId,
        user_properties: {
          is_patient_0: isPatient0
        }
      })
    }
    let isSameOriginPopup = false
    if (window.opener) {
      try {
        // cross-domain attempts to access opener.location.origin will throw
        // this makes sure that Parabol opened the popup
        isSameOriginPopup = !!window.opener.location.origin
      } catch {}
    }
    if (isSameOriginPopup) {
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
