import {cn} from '../../ui/cn'

interface Props {
  name: string
  // a narrow table has no Answered column, so its rows can say more under the name
  narrowMeta?: string | null
  wideMeta?: string | null
  isBold?: boolean
  isNested?: boolean
  className?: string
}

const ReportTeamHealthRowHeader = (props: Props) => {
  const {name, narrowMeta, wideMeta, isBold, isNested, className} = props
  return (
    <th
      scope='row'
      className={cn(
        'sticky left-0 z-10 bg-surface-card py-1 pr-2 text-left font-normal @3xl:shadow-none shadow-[1px_0_0_var(--color-hairline)]',
        isNested && '@3xl:pl-4 pl-3',
        className
      )}
    >
      <span
        className={cn(
          'block @3xl:max-w-60 max-w-[124px] truncate @3xl:text-sm text-[13px]',
          isBold ? 'font-bold' : 'font-medium'
        )}
      >
        {name}
      </span>
      {(narrowMeta || wideMeta) && (
        <span className='block truncate @3xl:text-xs text-[11px] text-fg-muted'>
          {narrowMeta && <span className='@3xl:hidden'>{narrowMeta}</span>}
          {wideMeta && <span className='@3xl:inline hidden'>{wideMeta}</span>}
        </span>
      )}
    </th>
  )
}

export default ReportTeamHealthRowHeader
