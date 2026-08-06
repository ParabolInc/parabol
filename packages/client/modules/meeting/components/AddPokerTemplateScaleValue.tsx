import {Button} from '~/ui/Button/Button'
import {Add} from '~/ui/icons'

interface Props {
  onClick: () => void
}

const AddTemplateScaleValue = (props: Props) => {
  const {onClick} = props
  return (
    <Button
      size='default'
      onClick={onClick}
      className='m-0 flex items-center justify-start border-hairline border-b bg-transparent p-0 px-0 py-2 text-[14px] text-sky-500 text-sm leading-5 leading-6 shadow-none outline-none hover:bg-surface-raised hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
    >
      <Add className='mx-4 block' />
      <div>Add value</div>
    </Button>
  )
}

export default AddTemplateScaleValue
