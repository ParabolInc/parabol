import {useSignInAndReturn} from '../../hooks/useSignInAndReturn'
import {Button} from '../../ui/Button/Button'

export const PageHeaderPublic = () => {
  const login = useSignInAndReturn()
  return (
    <div className='flex h-10 w-full items-center justify-center bg-grape-500 font-semibold text-white'>
      <div className='pr-4'>{`You’re one click away from collaborating`}</div>
      <Button variant='outline' onClick={login} className='m-1 text-white hover:bg-grape-400'>
        Sign up or Login
      </Button>
    </div>
  )
}
