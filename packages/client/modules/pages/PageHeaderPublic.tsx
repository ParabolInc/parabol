import {useNavigate} from 'react-router-dom'
import useAtmosphere from '../../hooks/useAtmosphere'
import {Button} from '../../ui/Button/Button'

export const PageHeaderPublic = () => {
  const navigate = useNavigate()
  const atmosphere = useAtmosphere()
  const login = () => {
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
  return (
    <div className='flex h-10 w-full items-center justify-center bg-grape-500 font-semibold text-white'>
      <div className='pr-4'>{`You’re one click away from collaborating`}</div>
      <Button variant='outline' onClick={login} className='m-1 text-white hover:bg-grape-400'>
        Sign up or Login
      </Button>
    </div>
  )
}
