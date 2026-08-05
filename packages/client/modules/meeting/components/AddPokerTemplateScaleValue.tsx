import {Add} from '@mui/icons-material'
import LinkButton from '../../../components/LinkButton'

interface Props {
  onClick: () => void
}

const AddTemplateScaleValue = (props: Props) => {
  const {onClick} = props
  return (
    <LinkButton
      palette='blue'
      onClick={onClick}
      className='m-0 flex items-center justify-start border-hairline border-b px-0 py-2 text-sm leading-6 outline-none hover:bg-surface-raised'
    >
      <Add className='mx-4 block' />
      <div>Add value</div>
    </LinkButton>
  )
}

export default AddTemplateScaleValue
