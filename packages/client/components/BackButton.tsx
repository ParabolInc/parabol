import {ArrowBack} from '@mui/icons-material'
import {Link} from 'react-router'
import FlatButton from './FlatButton'

interface Props {
  ariaLabel: string
  to: string
}

const BackButton = ({ariaLabel, to}: Props) => {
  return (
    <Link to={to}>
      <FlatButton
        aria-label={ariaLabel}
        className='mr-4 w-8 px-0 py-[3px] text-fg-secondary hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'
      >
        <ArrowBack className='text-inherit' />
      </FlatButton>
    </Link>
  )
}

export default BackButton
