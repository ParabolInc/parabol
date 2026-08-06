import {useNavigate} from 'react-router'
import {Add} from '~/ui/icons'
import {Button} from '../ui/Button/Button'
import {cn} from '../ui/cn'

const SideBarStartMeetingButton = ({isOpen}: {isOpen: boolean}) => {
  const navigate = useNavigate()

  const onClick = () => {
    navigate('/activity-library')
  }
  return (
    <div className='px-3'>
      <Button
        variant='primary'
        size='sm'
        className={cn(
          'mt-4 mb-3.5 h-10 overflow-hidden p-0 transition-all duration-300 ease-[cubic-bezier(0,0,.2,1)]',
          isOpen ? 'w-[232px] justify-center' : 'w-10 justify-start'
        )}
        onClick={onClick}
      >
        <Add className='ml-[7px]' />
        <div
          className={cn(
            'pr-[7px] pl-1 font-semibold text-[16px] transition-all duration-300 ease-[cubic-bezier(0,0,.2,1)]',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
        >
          Add Meeting
        </div>
      </Button>
    </div>
  )
}

export default SideBarStartMeetingButton
