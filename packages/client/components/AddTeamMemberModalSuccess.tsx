import {useEffect} from 'react'

interface Props {
  onClose: () => void
  successfulInvitations: string[]
}

const AddTeamMemberModalSuccess = (props: Props) => {
  const {onClose, successfulInvitations} = props

  useEffect(() => {
    const exitTimeoutId = window.setTimeout(() => {
      onClose()
    }, 5000)
    return () => {
      clearTimeout(exitTimeoutId)
    }
  }, [onClose])

  return (
    <div>
      <div className='mb-4 font-semibold text-xl'>Success!</div>
      <div>
        <span>An invitation has been sent to</span>
        {successfulInvitations.length === 1 ? <span> {successfulInvitations[0]}.</span> : ':'}
        {successfulInvitations.length > 1 && (
          <ul className='pl-4'>
            {successfulInvitations.map((email) => {
              return (
                <li className='block leading-6' key={email}>
                  {email}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default AddTeamMemberModalSuccess
