import {Delete} from '@mui/icons-material'
import {PlainButtonProps} from '../PlainButton/PlainButton'
import ReflectionCardButton from './ReflectionCardButton'

const DeleteReflectionButton = (props: PlainButtonProps) => {
  return (
    <ReflectionCardButton {...props} tooltipText='Delete this reflection card'>
      <Delete className='h-5 w-5' />
    </ReflectionCardButton>
  )
}

export default DeleteReflectionButton
