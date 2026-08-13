import type * as React from 'react'
import {useCallback, useRef} from 'react'

interface Props {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
}

const MenuSearch = (props: Props) => {
  const {onChange, placeholder, value} = props
  const ref = useRef<HTMLInputElement>(null)
  const onBlur = useCallback(() => {
    ref.current && ref.current.focus()
  }, [])
  return (
    <input
      autoFocus
      autoComplete='off'
      ref={ref}
      name='search'
      onBlur={onBlur}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
      className='block w-full appearance-none rounded-[2px] border border-hairline-field bg-inherit py-[3px] pr-0 pl-[39px] text-sm leading-6 outline-none focus:border-accent focus:shadow-[0_0_1px_1px_var(--color-sky-300)] active:border-accent active:shadow-[0_0_1px_1px_var(--color-sky-300)]'
    />
  )
}

export default MenuSearch
