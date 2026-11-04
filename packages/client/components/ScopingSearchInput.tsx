import type * as React from 'react'
import {useEffect, useRef} from 'react'
import {Close} from '~/ui/icons'
import {cn} from '../ui/cn'

interface Props {
  placeholder: string
  queryString: string
  defaultInput?: string
  onQueryStringChange(queryString: string): void
}

const ScopingSearchInput = (props: Props) => {
  const {placeholder, queryString, defaultInput, onQueryStringChange} = props
  const inputRef = useRef<HTMLInputElement>(null)
  const isEmpty = !queryString

  useEffect(() => {
    if (defaultInput) {
      onQueryStringChange(defaultInput)
    }
  }, [])

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    onQueryStringChange(value)
  }
  const clearSearch = () => {
    onQueryStringChange('')
    inputRef.current?.focus()
  }

  return (
    <div className='flex flex-1 items-center'>
      <input
        className='m-0 w-full appearance-none border-hairline-strong border-l border-none bg-transparent p-3 text-base text-fg-primary outline-none placeholder:text-fg-muted'
        value={queryString}
        placeholder={placeholder}
        onChange={handleOnChange}
        ref={inputRef}
      />
      <Close
        className={cn('m-3 cursor-pointer text-fg-secondary', isEmpty && 'invisible')}
        onClick={clearSearch}
      />
    </div>
  )
}

export default ScopingSearchInput
