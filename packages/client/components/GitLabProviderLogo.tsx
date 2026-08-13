import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import logo from '../styles/theme/images/graphics/gitlab-icon-rgb.svg'
import {cn} from '../ui/cn'

const GitLabProviderLogo = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  (props, ref) => {
    const {className, style, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn('h-12 w-12 bg-contain bg-no-repeat', className)}
        style={{backgroundImage: `url("${logo}")`, ...style}}
        {...rest}
      />
    )
  }
)

export default GitLabProviderLogo
