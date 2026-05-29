import Avatar from '../../../../components/Avatar/Avatar'

interface Props {
  picture: string | null
  preferredName: string
  email: string
}

const MeetingAvatarCard = ({picture, preferredName, email}: Props) => (
  <div className='flex items-center gap-2 px-3 py-1.5'>
    <Avatar picture={picture} alt={preferredName} className='h-7 w-7 shrink-0' />
    <div>
      <div className='text-slate-700 text-sm'>{preferredName}</div>
      <div className='text-slate-500 text-xs'>{email}</div>
    </div>
  </div>
)

export default MeetingAvatarCard
