import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import logo from '../styles/theme/images/graphics/jira-software-blue.svg'
import {cn} from '../ui/cn'

const JiraServerProviderLogo = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
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

export default JiraServerProviderLogo
