import type * as React from 'react'
import {useEffect, useRef} from 'react'
import {Search} from '~/ui/icons'
import {cn} from '../cn'

interface Props {
  placeholder: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  value: string
  className?: string
}

// keys radix menus own: let them bubble so dismiss & arrow navigation keep working
const RADIX_KEYS = new Set(['Escape', 'Tab', 'Enter', 'ArrowUp', 'ArrowDown'])

export const MenuSearch = (props: Props) => {
  const {onChange, placeholder, value, className} = props
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    // radix focuses the menu content on open, so wait a frame to claim focus back
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <div className={cn('relative mx-2 mb-2 flex items-center', className)}>
      <Search className='pointer-events-none absolute left-2 h-[18px] w-[18px] text-fg-secondary' />
      <input
        ref={inputRef}
        autoComplete='off'
        name='search'
        onChange={onChange}
        // radix menus type-ahead on printable keys, which would steal focus from this input
        onKeyDown={(e) => {
          if (!RADIX_KEYS.has(e.key)) e.stopPropagation()
        }}
        placeholder={placeholder}
        value={value}
        className='block w-full appearance-none rounded-[2px] border border-hairline-field bg-inherit py-[3px] pr-0 pl-[34px] text-sm leading-6 outline-none focus:border-accent focus:shadow-[0_0_1px_1px_var(--color-sky-300)]'
      />
    </div>
  )
}
