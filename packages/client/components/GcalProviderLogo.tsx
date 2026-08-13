import logo from '../styles/theme/images/graphics/google-calendar.svg'
import {cn} from '../ui/cn'

type Props = {
  className?: string
}

const GcalProviderLogo = (props: Props) => {
  const {className} = props
  return (
    <div
      className={cn('h-12 w-12 bg-contain bg-no-repeat', className)}
      style={{backgroundImage: `url("${logo}")`}}
    />
  )
}

export default GcalProviderLogo
