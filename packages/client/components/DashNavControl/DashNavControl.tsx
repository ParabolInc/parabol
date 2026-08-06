import {Button} from '../../ui/Button/Button'
import IconLabel from '../IconLabel'

interface Props {
  icon: string
  label: string
  onClick: () => void
}

const DashNavControl = (props: Props) => {
  const {icon, label, onClick} = props
  return (
    <Button
      aria-label={label}
      onClick={onClick}
      size='default'
      className='bg-transparent p-0 font-semibold text-[14px] text-fg-secondary leading-5 shadow-none hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'
    >
      <IconLabel icon={icon} iconLarge label={label} />
    </Button>
  )
}

export default DashNavControl
