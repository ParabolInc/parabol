import {useEffect} from 'react'

const SAMLRedirect = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (window.opener) {
      window.opener.postMessage({code: token}, window.location.origin)
    }

  }, [])
  return null
}

export default SAMLRedirect
