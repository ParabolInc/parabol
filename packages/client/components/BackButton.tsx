import {Link} from 'react-router'
import {Button} from '~/ui/Button/Button'
import {ArrowBack} from '~/ui/icons'

interface Props {
  ariaLabel: string
  to: string
}

const BackButton = ({ariaLabel, to}: Props) => {
  return (
    <Link to={to}>
      <Button
        variant='flat'
        size='sm'
        aria-label={ariaLabel}
        className='mr-4 w-8 px-0 py-[3px] text-fg-secondary hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'
      >
        <ArrowBack className='text-inherit' />
      </Button>
    </Link>
  )
}

export default BackButton
