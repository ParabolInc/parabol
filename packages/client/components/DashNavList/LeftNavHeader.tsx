import type {ReactNode} from 'react'

interface Props {
  children: ReactNode
}
export const LeftNavHeader = (props: Props) => {
  const {children} = props
  return <div className='flex flex-col p-1 text-xs font-medium'>{children}</div>
}
