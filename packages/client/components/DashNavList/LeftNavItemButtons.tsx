import type {ReactNode} from 'react'

interface Props {
  children: ReactNode
}
export const LeftNavItemButtons = (props: Props) => {
  const {children} = props
  return (
    <div
      // styles look odd because we must use opacity so any modals that come up have a referenced calculated pos (vs. display:none)
      className='flex w-0 items-center justify-end pr-1 opacity-0 group-hover:w-auto group-hover:opacity-100'
      onClick={(e) => {
        // Any clicks here should not propagate up to the parent anchor tag
        e.stopPropagation()
      }}
    >
      {children}
    </div>
  )
}
