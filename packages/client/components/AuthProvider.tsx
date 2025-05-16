import {useEffect, useState} from 'react'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InviteDialog from './InviteDialog'
import StyledError from './StyledError'

export const OAUTH_LOCAL_STORAGE_KEY = 'oauthData'

const AuthProvider = () => {
  const [error, setError] = useState('')
  useEffect(() => {
    const callOpener = async () => {
      const params = new URLSearchParams(window.location.search)
      // OAuth2
      const state = params.get('state')
      const code = params.get('code')
      if (state && code) {
        if (window.opener) return window.opener.postMessage({state, code}, window.location.origin)
        else {
          localStorage.setItem(OAUTH_LOCAL_STORAGE_KEY, JSON.stringify({state, code}))
          return window.close()
        }
      }
      // OAuth1
      const oauthToken = params.get('oauth_token')
      const oauthVerifier = params.get('oauth_verifier')
      if (oauthToken && oauthVerifier) {
        if (window.opener)
          return window.opener.postMessage({oauthToken, oauthVerifier}, window.location.origin)
        else {
          localStorage.setItem(OAUTH_LOCAL_STORAGE_KEY, JSON.stringify({oauthToken, oauthVerifier}))
          return window.close()
        }
      }
      // If opener exists but no valid params
      setError('Invalid authentication parameters received.')
    }
    callOpener().catch((err) => {
      setError(`Error processing authentication callback: ${err.message}`)
    })
  }, [])

  if (!error) {
    return null
  }
  return (
    <InviteDialog>
      <DialogTitle>{'Authentication Error'}</DialogTitle>
      <DialogContent>
        <StyledError>{error}</StyledError>
      </DialogContent>
    </InviteDialog>
  )
}

export default AuthProvider
