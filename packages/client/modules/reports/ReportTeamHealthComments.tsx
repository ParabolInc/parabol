import plural from '../../utils/plural'
import ReportTeamHealthComment from './ReportTeamHealthComment'

interface Props {
  comments: readonly {
    text: string
    author: {preferredName: string; picture: string} | null | undefined
  }[]
}

const ReportTeamHealthComments = ({comments}: Props) => (
  <section className='flex flex-col gap-2'>
    <h3 className='m-0 font-semibold text-fg-muted text-xs uppercase tracking-wide'>
      {comments.length === 0
        ? 'No comments'
        : `${comments.length} ${plural(comments.length, 'comment')}`}
    </h3>
    {comments.map(({text, author}, idx) => (
      <ReportTeamHealthComment key={idx} text={text} author={author ?? null} />
    ))}
    <span className='text-fg-muted text-xs'>Anonymous comments are reworded by AI</span>
  </section>
)

export default ReportTeamHealthComments
