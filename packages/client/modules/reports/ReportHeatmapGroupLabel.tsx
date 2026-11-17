interface Props {
  label: string
  colSpan: number
}

// heads the rows of one group, like a business unit's teams; it stays in view when the table scrolls sideways
const ReportHeatmapGroupLabel = ({label, colSpan}: Props) => (
  <tr>
    <th
      scope='rowgroup'
      colSpan={colSpan}
      className='pt-3 pb-1 text-left font-semibold text-[13px] text-fg-primary'
    >
      <span className='sticky left-0'>{label}</span>
    </th>
  </tr>
)

export default ReportHeatmapGroupLabel
