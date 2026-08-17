import {useState} from 'react'
import {useSelector} from 'react-redux'
import useAtmosphere from '../hooks/useAtmosphere'
import {isAuthorized} from '../selectors'

const AutoLogin = () => {
  const atmosphere = useAtmosphere()
  const loggedIn = useSelector(isAuthorized)
  const [pending, setPending] = useState(false)

  if (loggedIn) return null

  const handleConnect = async () => {
    setPending(true)
    try {
      await atmosphere.login()
    } finally {
      setPending(false)
    }
  }

  return (
    <div style={{padding: 16, textAlign: 'center'}}>
      <button onClick={handleConnect} disabled={pending}>
        {pending ? 'Connecting…' : 'Connect to Parabol'}
      </button>
    </div>
  )
}

export default AutoLogin
