import ReportDelta from './ReportDelta'

interface Props {
  label: string
  value: number
  detail: string
  change: number | null
  comparison: string
}

const ReportHeadlineNumber = ({label, value, detail, change, comparison}: Props) => (
  <section className='flex min-w-0 flex-col gap-0.5 rounded-md border border-hairline bg-surface-card px-4 py-3 shadow-xs max-sm:row-span-3 max-sm:grid max-sm:grid-rows-subgrid sm:px-5 sm:py-4'>
    <h2 className='m-0 font-semibold text-[13px] text-fg-secondary'>{label}</h2>
    <div className='flex flex-wrap content-start items-baseline gap-x-2'>
      <span className='font-bold text-3xl tabular-nums'>{value.toLocaleString()}</span>
      <span className='text-[13px] text-fg-muted'>{detail}</span>
    </div>
    {change !== null && <ReportDelta change={change} comparison={comparison} />}
  </section>
)

export default ReportHeadlineNumber
