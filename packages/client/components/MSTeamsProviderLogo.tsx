import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import logo from '../styles/theme/images/graphics/msteams.svg'
import {cn} from '../ui/cn'

const MSTeamsProviderLogo = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  (props, ref) => {
    const {className, style, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn('h-[45px] w-12 bg-contain bg-no-repeat', className)}
        style={{backgroundImage: `url("${logo}")`, ...style}}
        {...rest}
      />
    )
  }
)

export default MSTeamsProviderLogo
