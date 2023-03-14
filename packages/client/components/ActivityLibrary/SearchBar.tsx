import React, {ChangeEvent} from 'react'
import {Search as SearchIcon} from '@mui/icons-material'

interface Props {
  searchQuery: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

const SearchBar = (props: Props) => {
  const {searchQuery, onChange} = props
  return (
    <div className='my-4 ml-2 flex items-center'>
      <SearchIcon className='text-slate-600' />
      <input
        className='ml-2 w-full max-w-6xl border-none bg-transparent font-sans text-xl text-slate-700 placeholder-slate-600 outline-none'
        autoFocus
        autoComplete='off'
        name='search'
        placeholder='Search Activities'
        type='text'
        onChange={onChange}
        value={searchQuery}
      />
    </div>
  )
}

export default SearchBar
