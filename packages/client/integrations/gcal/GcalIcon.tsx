import googleCalendarLogo from '../../styles/theme/images/graphics/google-calendar.svg'
import {cn} from '../../ui/cn'

interface Props {
  className?: string
}

const GcalIcon = ({className}: Props) => (
  <img src={googleCalendarLogo} alt='' className={cn('h-6 w-6', className)} />
)

export default GcalIcon
