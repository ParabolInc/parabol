import {useEffect, useState} from 'react'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InviteDialog from './InviteDialog'
import StyledError from './StyledError'

const AuthProvider = () => {
  console.log(
    '[AuthProvider] Component function CALLED. Current URL in popup:',
    window.location.href
  )
  const [error, setError] = useState('')
  useEffect(() => {
    console.log('[AuthProvider] useEffect hook ENTERED. window.opener in popup:', window.opener)
    const callOpener = async () => {
      console.log(
        '[AuthProvider] callOpener async function CALLED. window.opener in popup:',
        window.opener
      )
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
    callOpener().catch((err) => {
      console.error('[AuthProvider] Error in callOpener catch block:', err)
      setError('Error processing authentication')
    })
  }, [])

  if (!error) {
    console.log('[AuthProvider] No error set, rendering null.')
    return null
  }
  console.log('[AuthProvider] Error IS set, rendering error dialog. Error:', error)
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
