import {useNavigate} from 'react-router'
import useBreakpoint from '../hooks/useBreakpoint'
import GiftSVG from './GiftSVG'
import LinkButton from './LinkButton'

const DemoCreateAccountButton = () => {
  const navigate = useNavigate()
  const handleClick = () => navigate('/create-account?from=demo')
  const isBreakpoint = useBreakpoint(480)
  return (
    <LinkButton
      palette='blue'
      onClick={handleClick}
      className='mr-4 h-8 font-semibold text-[13px] xl:text-[15px] min-[1600px]:text-[16px]'
    >
      <GiftSVG />
      {isBreakpoint && <div className='ml-2'>{'Create Free Account'}</div>}
    </LinkButton>
  )
}

export default DemoCreateAccountButton
