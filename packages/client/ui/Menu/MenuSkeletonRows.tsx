const WIDTHS = ['w-[70%]', 'w-[52%]', 'w-[62%]', 'w-[44%]']

interface Props {
  count: number
}

const MenuSkeletonRows = ({count}: Props) => (
  <div aria-hidden='true'>
    {Array.from({length: count}, (_, index) => (
      <div key={index} className='flex h-9 items-center gap-3 px-4'>
        <span className='h-[18px] w-[18px] flex-none animate-pulse rounded-full bg-surface-well' />
        <span
          className={`h-3 animate-pulse rounded-sm bg-surface-well ${WIDTHS[index % WIDTHS.length]}`}
        />
      </div>
    ))}
  </div>
)

export default MenuSkeletonRows
