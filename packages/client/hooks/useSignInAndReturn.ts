import {useNavigate} from 'react-router'
import useAtmosphere from './useAtmosphere'

export const useSignInAndReturn = () => {
  const navigate = useNavigate()
  const atmosphere = useAtmosphere()
  return () => {
    // necessary because the page access may be cached
    // to reproduce:
    // Browser 1 sets page to Public -> Viewer
    // Browser 2 navigates to the page, not logged in
    // Browser 1 changes to Public -> Editor (change is not propagated to user who is not logged in)
    // Browser 2 logs in, gets redirected, still sees Public -> Viewer since it's using the cached query
    atmosphere.close()
    navigate(
      {
        pathname: '/',
        search: `?redirectTo=${encodeURIComponent(window.location.pathname)}`
      },
      {replace: true}
    )
  }
}
