interface Props {
  comments: readonly string[]
  respondentCount: number
}

const ReportTeamHealthComments = ({comments, respondentCount}: Props) => (
  <section className='flex flex-col gap-2'>
    <h3 className='m-0 font-semibold text-fg-muted text-xs uppercase tracking-wide'>
      {comments.length === 0
        ? 'No comments'
        : `${comments.length} of ${Math.max(respondentCount, comments.length)} people commented`}
    </h3>
    {comments.map((comment, idx) => (
      <blockquote key={idx} className='m-0 rounded-md bg-surface-raised px-3 py-2.5 text-sm'>
        “{comment}”
      </blockquote>
    ))}
    <span className='text-fg-muted text-xs'>
      Reports never show who wrote a comment. Anonymous comments were reworded by AI.
    </span>
  </section>
)

export default ReportTeamHealthComments
