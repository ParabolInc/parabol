import {useNavigate} from 'react-router'
import useBreakpoint from '../hooks/useBreakpoint'
import {Button} from '../ui/Button/Button'
import GiftSVG from './GiftSVG'

const DemoCreateAccountButton = () => {
  const navigate = useNavigate()
  const handleClick = () => navigate('/create-account?from=demo')
  const isBreakpoint = useBreakpoint(480)
  return (
    <Button
      onClick={handleClick}
      size='default'
      className='mr-4 h-8 bg-transparent p-0 font-semibold text-[13px] text-sky-500 leading-5 shadow-none hover:text-sky-600 focus:text-sky-600 active:text-sky-600 xl:text-[15px] min-[1600px]:text-[16px]'
    >
      <GiftSVG />
      {isBreakpoint && <div className='ml-2'>{'Create Free Account'}</div>}
    </Button>
  )
}

export default DemoCreateAccountButton
