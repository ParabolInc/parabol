import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import atlassianMark from './styles/theme/images/graphics/atlassian-gradient.svg'
import {cn} from './ui/cn'

const AtlassianProviderLogo = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, style, ...rest} = props
    return (
      <div
        {...rest}
        ref={ref}
        className={cn('h-12 w-12 bg-contain bg-no-repeat', className)}
        style={{backgroundImage: `url("${atlassianMark}")`, ...style}}
      />
    )
  }
)

export default AtlassianProviderLogo
