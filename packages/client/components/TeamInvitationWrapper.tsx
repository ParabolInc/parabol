import React, {ReactNode} from 'react'
import Header from './AuthPage/Header'

interface Props {
  children: ReactNode
}

function TeamInvitationWrapper(props: Props) {
  const {children} = props
  return (
    <div className='min-h-100 flex max-w-full flex-1 flex-col items-center overflow-auto bg-slate-200 text-slate-700'>
      <Header />
      <div className='maxw-full flex w-full flex-1 flex-col items-center py-8 px-4'>{children}</div>
    </div>
  )
}

export default TeamInvitationWrapper
