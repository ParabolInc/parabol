import {useEffect} from 'react'

const SAMLRedirect = () => {
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token= params.get('token')
    const error = params.get('error')
    if (window.opener) {
      window.opener.postMessage({token, error}, window.location.origin)
    }

  }, [])
  return null
}

export default SAMLRedirect
