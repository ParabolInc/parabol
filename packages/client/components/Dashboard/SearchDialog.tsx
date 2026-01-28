import SearchIcon from '@mui/icons-material/Search'
import {VisuallyHidden} from '@radix-ui/react-visually-hidden'
import {useRef, useState} from 'react'
import {useDebouncedSearch} from '../../hooks/useDebouncedSearch'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {DialogTrigger} from '../../ui/Dialog/DialogTrigger'
import {ModIcon} from '../../utils/platform'
import {SearchDialogResultsRoot} from '../DashNavList/SearchDialogResultsRoot'
import LeftDashNavItem from './LeftDashNavItem'

interface Props {}

export type ResultsListRefHandler = {onKeyDown: (e: React.KeyboardEvent) => boolean}

export const SearchDialog = (_props: Props) => {
  const [inputQuery, setInputQuery] = useState('')
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setInputQuery(value)
  }
  const {debouncedSearch} = useDebouncedSearch(inputQuery)
  const [open, setOpen] = useState(false)
  const closeSearch = () => setOpen(false)
  const openSearch = () => setOpen(true)
  const onOpenChange = (willOpen: boolean) => {
    setOpen(willOpen)
  }

  const resultsListRef = useRef<ResultsListRefHandler>(null)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    resultsListRef.current?.onKeyDown(e)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <LeftDashNavItem Icon={SearchIcon} href={''} label={'Search'} exact onClick={openSearch} />
      </DialogTrigger>
      <DialogContent
        className={
          'top-[15%] w-full translate-y-0 animate-in overflow-hidden bg-white p-0 duration-200 focus:outline-none'
        }
      >
        <VisuallyHidden asChild>
          <DialogTitle>Search</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden asChild>
          <DialogDescription>Search for pages and content in Parabol</DialogDescription>
        </VisuallyHidden>

        {/* Search Header */}
        <div className='flex items-center px-2 py-2'>
          <SearchIcon className='mr-3 text-slate-500' sx={{fontSize: 22}} />
          <input
            autoFocus
            name='search'
            onChange={onChange}
            onKeyDown={handleKeyDown}
            className='flex-1 bg-transparent font-light text-lg outline-none placeholder:text-slate-500'
            placeholder='Search pages…'
            type='text'
            autoComplete='off'
          />
        </div>

        {/* Results Area */}
        <div className='max-h-[400px] overflow-y-auto px-2 py-1'>
          <section className='relative'>
            <SearchDialogResultsRoot
              resultsListRef={resultsListRef}
              searchQuery={debouncedSearch}
              closeSearch={closeSearch}
            />
          </section>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-slate-100 border-t px-4 py-2.5 text-[11px] text-slate-500'>
          <div className='flex items-center gap-4'>
            <span className='flex items-center gap-1'>
              <ModIcon sx={{fontSize: 12}} /> + Enter to open
            </span>
            <span className='flex items-center gap-1'>
              <span className='rounded border bg-white px-1'>↑↓</span> to navigate
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='rounded bg-blue-50 px-1.5 py-0.5 font-medium text-blue-600'>
              Hybrid Search
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
