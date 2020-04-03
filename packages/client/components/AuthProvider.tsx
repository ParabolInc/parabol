import React, {useEffect, useState} from 'react'
import InviteDialog from './InviteDialog'
import DialogTitle from './DialogTitle'
import DialogContent from './DialogContent'
import StyledError from './StyledError'

const AuthProvider = () => {
  const [error, setError] = useState('')
  useEffect(() => {
    const callOpener = async () => {
      const params = new URLSearchParams(window.location.search)
      const state = params.get('state')
      const code = params.get('code')
      if (window.opener && state && code) {
        window.opener.postMessage({state, code}, window.location.origin)
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
