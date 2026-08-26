import type {ReactNode} from 'react'
import {cn} from '../../ui/cn'

interface Props {
  children: ReactNode
  isMenuOpen?: boolean
}
export const LeftNavItemButtons = (props: Props) => {
  const {children, isMenuOpen} = props
  return (
    <div
      // styles look odd because we must use opacity so any modals that come up have a referenced calculated pos (vs. display:none)
      className={cn(
        'flex w-0 items-center justify-end pr-1 opacity-0 group-hover:w-auto group-hover:opacity-100',
        isMenuOpen && 'w-auto opacity-100'
      )}
      onClick={(e) => {
        // Any clicks here should not propagate up to the parent anchor tag
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {children}
    </div>
  )
}
