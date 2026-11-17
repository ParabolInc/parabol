import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import slackMark from '../styles/theme/images/graphics/slack-color.svg'
import {cn} from '../ui/cn'

const SlackProviderLogo = forwardRef(
  (props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
    const {className, style, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn('h-12 w-12 bg-contain bg-no-repeat', className)}
        style={{backgroundImage: `url("${slackMark}")`, ...style}}
        {...rest}
      />
    )
  }
)

export default SlackProviderLogo
