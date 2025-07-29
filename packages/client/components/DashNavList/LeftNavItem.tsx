import type {ReactNode} from 'react'

interface Props {
  children: ReactNode
}
export const LeftNavItem = (props: Props) => {
  const {children} = props
  return <div className='flex flex-1 flex-col font-medium text-sm'>{children}</div>
}
