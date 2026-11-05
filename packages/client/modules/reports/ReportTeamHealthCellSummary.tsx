import {AutoAwesome} from '~/ui/icons'
import Ellipsis from '../../components/Ellipsis/Ellipsis'

interface Props {
  summary: string | null | undefined
  isLoadingSummary: boolean
}

const ReportTeamHealthCellSummary = ({summary, isLoadingSummary}: Props) => (
  <section className='flex flex-col gap-1.5'>
    <h3 className='m-0 flex items-center gap-1.5 font-semibold text-fg-muted text-xs uppercase tracking-wide'>
      <AutoAwesome className='size-4 text-accent' />
      AI summary
    </h3>
    <div aria-live='polite' className='text-sm leading-[21px]'>
      {summary ? (
        <p className='m-0'>{summary}</p>
      ) : isLoadingSummary ? (
        <p className='m-0 text-fg-muted'>
          Summarizing
          <Ellipsis />
        </p>
      ) : (
        <p className='m-0 text-fg-muted'>No summary</p>
      )}
    </div>
  </section>
)

export default ReportTeamHealthCellSummary
