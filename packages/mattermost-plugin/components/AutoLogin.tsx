import {useEffect} from 'react'
import {useSelector} from 'react-redux'
import useAtmosphere from '../hooks/useAtmosphere'
import {isAuthorized} from '../selectors'

const AutoLogin = () => {
  const atmosphere = useAtmosphere()
  const loggedIn = useSelector(isAuthorized)

  useEffect(() => {
    if (!loggedIn) {
      atmosphere.login()
    }
  }, [atmosphere, loggedIn])

  return null
}

export default AutoLogin
