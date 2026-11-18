import {createLink} from '@tanstack/react-router'
import type {ComponentProps} from 'react'
import {cn} from '../ui/cn'

const StyledLink = createLink(({className, ...props}: ComponentProps<'a'>) => (
  <a
    className={cn(
      'text-accent outline-0 hover:text-sky-600 focus:text-sky-600 active:text-sky-600',
      className
    )}
    {...props}
  />
))

export default StyledLink
