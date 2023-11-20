import React, {ChangeEvent} from 'react'

interface Props {
  searchQuery: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

const AISearchBar = (props: Props) => {
  const {searchQuery, onChange} = props
  return (
    <div className='ml-2 flex grow items-center rounded-full bg-slate-200 px-4 py-2 outline-none outline-1 outline-offset-0 focus-within:outline-sky-500'>
      <input
        className='w-full border-none bg-transparent font-sans text-sm text-slate-700 placeholder-slate-800 outline-none'
        autoFocus
        autoComplete='off'
        name='search'
        placeholder='Ask our AI which template to use'
        type='text'
        onChange={onChange}
        value={searchQuery}
      />
      <span className='text-slate-600' role='img' aria-label='sparkles'>
        ✨
      </span>
    </div>
  )
}

export default AISearchBar
