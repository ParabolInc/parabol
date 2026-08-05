import {Add} from '@mui/icons-material'
import {useNavigate} from 'react-router'
import {cn} from '../ui/cn'
import FlatPrimaryButton from './FlatPrimaryButton'

const SideBarStartMeetingButton = ({isOpen}: {isOpen: boolean}) => {
  const navigate = useNavigate()

  const onClick = () => {
    navigate('/activity-library')
  }
  return (
    <div className='px-3'>
      <FlatPrimaryButton
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
      </FlatPrimaryButton>
    </div>
  )
}

export default SideBarStartMeetingButton
