import {useEffect} from 'react'
import {LoaderSize} from '../types/constEnums'
import LoadingComponent from './LoadingComponent/LoadingComponent'

const OAuthAuthorizePage = () => {
  useEffect(() => {
    // break out of SPA to get back to the server route
    window.location.assign(window.location.href)
  }, [])

  return <LoadingComponent spinnerSize={LoaderSize.WHOLE_PAGE} />
}

export default OAuthAuthorizePage
