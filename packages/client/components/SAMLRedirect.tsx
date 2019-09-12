import React, {useEffect, useState} from 'react'
import DialogTitle from './DialogTitle'
import DialogContent from './DialogContent'
import StyledError from './StyledError'
import InviteDialog from './InviteDialog'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'

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
        history.replace('/me')
      }
    }
  }, [])

  if (error) {
    return (
      <InviteDialog>
        <DialogTitle>SSO Login</DialogTitle>
        <DialogContent>
          <StyledError>{'Error logging in from SSO Provider. Please try again.'}</StyledError>}
        </DialogContent>
      </InviteDialog>
    )
  }
  return null
}

export default SAMLRedirect
