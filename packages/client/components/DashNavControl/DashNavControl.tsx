import IconLabel from '../IconLabel'
import LinkButton from '../LinkButton'

interface Props {
  icon: string
  label: string
  onClick: () => void
}

const DashNavControl = (props: Props) => {
  const {icon, label, onClick} = props
  return (
    <LinkButton
      aria-label={label}
      onClick={onClick}
      className='font-semibold text-fg-secondary hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'
    >
      <IconLabel icon={icon} iconLarge label={label} />
    </LinkButton>
  )
}

export default DashNavControl
