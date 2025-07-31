import type {ReactNode} from 'react'

interface Props {
  children: ReactNode
}
export const LeftNavHeader = (props: Props) => {
  const {children} = props
  return <div className='flex flex-1 items-center p-1 font-medium text-xs'>{children}</div>
}
