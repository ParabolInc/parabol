import {CheckCircle} from '~/ui/icons'
import plural from '../utils/plural'

interface Props {
  sentEmails: string[]
}

const TeamInviteSentList = (props: Props) => {
  const {sentEmails} = props
  return (
    <div role='status'>
      {sentEmails.length > 0 && (
        <>
          <div className='mt-6 flex items-center gap-2 font-semibold text-fg-primary text-sm leading-5'>
            <CheckCircle className='text-jade-600 text-lg dark:text-jade-400' />
            {sentEmails.length} {plural(sentEmails.length, 'invitation')} sent
          </div>
          <ul className='m-0 mt-1 list-none p-0 pl-7 text-fg-secondary text-sm leading-6'>
            {sentEmails.map((email) => (
              <li key={email} className='wrap-anywhere'>
                {email}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default TeamInviteSentList
