import {Lock, MailOutline} from '@mui/icons-material'
import React, {useState} from 'react'
import PrimaryButton from './PrimaryButton'

const RequestToJoinComponent = () => {
  const [isRequested, setIsRequested] = useState(false)

  const handleRequestJoin = () => {
    setIsRequested(true)
  }

  return (
    <div className='relative z-10 flex h-full w-full flex-col items-center justify-center overflow-y-auto'>
      <div className='mb-20 flex max-h-[90vh] w-[50%] min-w-[280px] max-w-[calc(100vw-48px)] flex-col items-center rounded bg-white p-8 shadow-2xl'>
        {isRequested ? (
          <MailOutline className='text-purple-500 h-10 w-10 rounded-full' />
        ) : (
          <Lock className='text-purple-500 h-10 w-10 rounded-full' />
        )}
        <div className='text-gray-700 my-4 flex flex-col items-center justify-between text-sm font-semibold leading-5'>
          {isRequested ? 'Request Sent' : 'Request to Join'}
        </div>
        <div className='my-2 mb-7 px-16 text-center text-sm leading-5'>
          {isRequested
            ? 'Your request to join the team has been sent.'
            : "You're not a member of this team yet. Click below to request to join the team."}
        </div>
        {!isRequested && (
          <PrimaryButton onClick={handleRequestJoin}>{'Request to Join'}</PrimaryButton>
        )}
      </div>
    </div>
  )
}

export default RequestToJoinComponent
