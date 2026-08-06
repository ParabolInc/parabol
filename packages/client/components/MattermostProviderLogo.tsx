import {type ComponentPropsWithoutRef, type CSSProperties, forwardRef} from 'react'
import logo from '../styles/theme/images/graphics/mattermost.svg'
import logoWhite from '../styles/theme/images/graphics/mattermost-white.svg'
import {cn} from '../ui/cn'

const MattermostProviderLogo = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  (props, ref) => {
    const {className, style, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn(
          'h-12 w-12 bg-[image:var(--mattermost-logo)] bg-contain bg-no-repeat dark:bg-[image:var(--mattermost-logo-dark)]',
          className
        )}
        style={
          {
            '--mattermost-logo': `url("${logo}")`,
            '--mattermost-logo-dark': `url("${logoWhite}")`,
            ...style
          } as CSSProperties
        }
        {...rest}
      />
    )
  }
)

export default MattermostProviderLogo
