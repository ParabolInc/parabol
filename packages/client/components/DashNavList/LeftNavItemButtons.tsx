import type {ReactNode} from 'react'

interface Props {
  children: ReactNode
}
export const LeftNavItemButtons = (props: Props) => {
  const {children} = props
  return <div className='flex flex-1 items-center justify-end pr-1'>{children}</div>
}
