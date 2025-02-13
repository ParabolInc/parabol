import {ReactNode} from 'react'
import Header from './AuthPage/Header'

interface Props {
  children: ReactNode
}

function TeamInvitationWrapper(props: Props) {
  const {children} = props
  return (
    <div className='flex min-h-full max-w-full flex-1 flex-col items-center overflow-auto bg-slate-200 text-slate-700'>
      <Header />
      <div className='maxw-full flex w-full flex-1 flex-col items-center px-4 py-8'>{children}</div>
    </div>
  )
}

export default TeamInvitationWrapper
