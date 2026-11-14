import {Link} from 'react-router'
import logoMarkPurple from '../../styles/theme/images/brand/mark-color.svg'
import {cn} from '../../ui/cn'

interface Props {
  onClick?: () => void
  className?: string
}

const LogoBlock = (props: Props) => {
  const {onClick, className} = props
  return (
    <div className={cn('box-content flex select-none items-end justify-center p-2', className)}>
      <Link className='block' title='My Dashboard' to='/meetings' onClick={onClick}>
        <img className='block w-8' crossOrigin='' alt='Parabol' src={logoMarkPurple} />
      </Link>
    </div>
  )
}

export default LogoBlock
