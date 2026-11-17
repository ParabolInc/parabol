import Avatar from '../../components/Avatar/Avatar'

interface Props {
  text: string
  author: {preferredName: string; picture: string} | null
}

const ReportTeamHealthComment = ({text, author}: Props) => (
  <blockquote className='m-0 flex flex-col gap-2 rounded-md bg-surface-raised px-3 py-2.5 text-sm'>
    <span>“{text}”</span>
    {author && (
      <span className='flex items-center justify-end gap-1.5'>
        <Avatar picture={author.picture} className='size-5' />
        <span className='font-semibold text-[13px] text-fg-secondary'>{author.preferredName}</span>
      </span>
    )}
  </blockquote>
)

export default ReportTeamHealthComment
