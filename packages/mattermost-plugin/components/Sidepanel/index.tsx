import {useSelector} from 'react-redux'
import useAtmosphere from '../../hooks/useAtmosphere'
import {getPluginServerRoute, isAuthorized} from '../../selectors'
import SidePanel from './SidePanel'

const SidePanelRoot = () => {
  const atmosphere = useAtmosphere()
  const loggedIn = useSelector(isAuthorized)
  const pluginServerRoute = useSelector(getPluginServerRoute)

  return (
    <div className='flex flex-col items-stretch overflow-y-auto p-4'>
      {loggedIn ? (
        <SidePanel />
      ) : (
        <div>
          <p>
            You are not logged in to{' '}
            <a href={`${pluginServerRoute}/parabol/create-account`}>Parabol</a>
          </p>
          <button onClick={atmosphere.login}>Login</button>
        </div>
      )}
    </div>
  )
}

export default SidePanelRoot
