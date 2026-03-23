import type {ReactNode} from 'react'

interface Props {
  children: ReactNode
  currentFilters?: ReactNode
}

const ScopingSearchBar = (props: Props) => {
  const {children, currentFilters} = props
  return (
    <div className='p-4'>
      <div className='flex h-11 w-full items-center rounded-[40px] border border-slate-400 px-4'>
        {children}
      </div>
      {currentFilters && (
        <div className='flex w-full pt-2 pl-[72px]'>
          <div className='whitespace-nowrap font-medium text-base text-slate-600'>
            Current filters:
          </div>
          <div className='w-full overflow-hidden text-ellipsis whitespace-nowrap px-1 pr-6 font-semibold text-base text-slate-600 italic'>
            {currentFilters}
          </div>
        </div>
      )}
    </div>
  )
}

export default ScopingSearchBar
