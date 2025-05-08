import {useSelector} from 'react-redux'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useConfig} from '../../hooks/useConfig'
import {isAuthorized} from '../../selectors'
import SidePanel from './SidePanel'

const SidePanelRoot = () => {
  const atmosphere = useAtmosphere()
  const loggedIn = useSelector(isAuthorized)
  const config = useConfig()
  const {parabolUrl} = config

  return (
    <div className='flex h-full flex-col items-stretch p-4'>
      {loggedIn ? (
        <SidePanel />
      ) : (
        <div>
          <p className='py-4'>
            You are not logged in to Parabol.
            <br />
            Please{' '}
            <a href={`${parabolUrl}/signin`} target='_blank' rel='noopener noreferrer'>
              sign in
            </a>{' '}
            or{' '}
            <a href={`${parabolUrl}/create-account`} target='_blank' rel='noopener noreferrer'>
              create an account
            </a>{' '}
            and retry.
          </p>
          <button className='btn btn-primary' onClick={atmosphere.login}>
            Retry
          </button>
        </div>
      )}
    </div>
  )
}

export default SidePanelRoot
