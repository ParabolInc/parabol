import type {ReactNode} from 'react'
import DashContent from '../../../../components/Dashboard/DashContent'

interface Props {
  children: ReactNode
}

const UserSettingsWrapper = (props: Props) => {
  const {children} = props
  return (
    <DashContent className='px-4'>
      <div className='mx-auto flex w-full max-w-[768px] flex-col items-center'>{children}</div>
    </DashContent>
  )
}

export default UserSettingsWrapper
