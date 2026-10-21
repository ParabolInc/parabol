import ReportDelta from './ReportDelta'

interface Props {
  label: string
  value: number
  detail: string
  change: number | null
  comparison: string
}

const ReportHeadlineNumber = ({label, value, detail, change, comparison}: Props) => (
  <section className='flex flex-col gap-0.5 rounded-md border border-hairline bg-surface-card px-5 py-4 shadow-xs'>
    <h2 className='m-0 font-semibold text-[13px] text-fg-secondary'>{label}</h2>
    <div className='flex flex-wrap items-baseline gap-x-2'>
      <span className='font-bold text-3xl tabular-nums'>{value.toLocaleString()}</span>
      <span className='text-[13px] text-fg-muted'>{detail}</span>
    </div>
    {change !== null && <ReportDelta change={change} comparison={comparison} />}
  </section>
)

export default ReportHeadlineNumber
