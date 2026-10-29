import ReportTeamHealthComment from './ReportTeamHealthComment'

interface Props {
  comments: readonly {
    text: string
    author: {preferredName: string; picture: string} | null | undefined
  }[]
  respondentCount: number
}

const ReportTeamHealthComments = ({comments, respondentCount}: Props) => (
  <section className='flex flex-col gap-2'>
    <h3 className='m-0 font-semibold text-fg-muted text-xs uppercase tracking-wide'>
      {comments.length === 0
        ? 'No comments'
        : `${comments.length} of ${Math.max(respondentCount, comments.length)} people commented`}
    </h3>
    {comments.map(({text, author}, idx) => (
      <ReportTeamHealthComment key={idx} text={text} author={author ?? null} />
    ))}
    <span className='text-fg-muted text-xs'>
      Anonymous comments were reworded by AI and show no name.
    </span>
  </section>
)

export default ReportTeamHealthComments
