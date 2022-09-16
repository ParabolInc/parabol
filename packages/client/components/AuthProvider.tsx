import React, {useEffect, useState} from 'react'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InviteDialog from './InviteDialog'
import StyledError from './StyledError'

const AuthProvider = () => {
  const [error, setError] = useState('')
  useEffect(() => {
    const callOpener = async () => {
      const params = new URLSearchParams(window.location.search)
      if (window.opener) {
        // OAuth2
        const state = params.get('state')
        const code = params.get('code')
        if (state && code) {
          return window.opener.postMessage({state, code}, window.location.origin)
        }
        // OAuth1
        const oauthToken = params.get('oauth_token')
        const oauthVerifier = params.get('oauth_verifier')
        if (oauthToken && oauthVerifier) {
          return window.opener.postMessage({oauthToken, oauthVerifier}, window.location.origin)
        }
      } else {
        setError('Error logging in')
      }
    }
    callOpener().catch()
  }, [])

  if (!error) return null
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
