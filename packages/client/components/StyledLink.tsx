import {forwardRef, type Ref} from 'react'
import {Link, type LinkProps} from 'react-router'
import {cn} from '../ui/cn'

const StyledLink = forwardRef((props: LinkProps, ref: Ref<HTMLAnchorElement>) => {
  const {className, ...rest} = props
  return (
    <Link
      ref={ref}
      className={cn(
        'text-accent outline-0 hover:text-sky-600 focus:text-sky-600 active:text-sky-600',
        className
      )}
      {...rest}
    />
  )
})

export default StyledLink
