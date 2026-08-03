import {TaskAltOutlined} from '@mui/icons-material'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  onClick: () => void
  disabled?: boolean
}

const AddTaskButton = (props: Props) => {
  const {onClick, disabled} = props

  return (
    <PlainButton
      className='mx-2 flex items-center justify-center font-semibold text-accent text-sm transition-[color] duration-100 ease-[ease] hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
      onClick={onClick}
      disabled={disabled}
    >
      <TaskAltOutlined className='mr-1 h-5 w-5' />
      <div className='text-inherit'>Add a task</div>
    </PlainButton>
  )
}

export default AddTaskButton
