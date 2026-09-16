import type {ReactNode} from 'react'

interface Props {
  children: ReactNode
}
export const LeftNavItem = (props: Props) => {
  const {children} = props
  return <div className='flex-1 truncate font-medium text-sm'>{children}</div>
}
