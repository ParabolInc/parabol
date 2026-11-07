import clickupLogo from '../../styles/theme/images/graphics/clickup.svg'
import {cn} from '../../ui/cn'

interface Props {
  className?: string
}

const ClickUpIcon = ({className}: Props) => (
  <img src={clickupLogo} alt='' className={cn('h-6 w-6', className)} />
)

export default ClickUpIcon
