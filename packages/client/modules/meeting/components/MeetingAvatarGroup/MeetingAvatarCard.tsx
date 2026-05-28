interface Props {
  picture: string
  preferredName: string
  email: string
}

const MeetingAvatarCard = ({picture, preferredName, email}: Props) => (
  <div className='flex items-center gap-2 px-3 py-1.5'>
    <img src={picture} alt={preferredName} className='h-7 w-7 shrink-0 rounded-full object-cover' />
    <div>
      <div className='text-slate-700 text-sm'>{preferredName}</div>
      <div className='text-slate-500 text-xs'>{email}</div>
    </div>
  </div>
)

export default MeetingAvatarCard
