import {useEffect} from 'react'

const OAuthAuthorizePage = () => {
  useEffect(() => {
    // break out of SPA to get back to the server route
    window.location.assign(window.location.href)
  }, [])

  return null
}

export default OAuthAuthorizePage
