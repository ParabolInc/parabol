import {twMerge} from 'tailwind-merge'
import logo from '../styles/theme/images/graphics/zoom-logo.svg'

type Props = {
  className?: string
}

const ZoomProviderLogo = (props: Props) => {
  const {className} = props
  return (
    <div
      className={twMerge('h-6 w-6 bg-contain bg-no-repeat', className)}
      style={{backgroundImage: `url(${logo})`}}
    ></div>
  )
}

export default ZoomProviderLogo
