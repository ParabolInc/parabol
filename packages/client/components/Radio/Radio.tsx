import type * as React from 'react'

interface Props {
  checked: boolean
  label: string
  name: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  value: string
}

const Radio = (props: Props) => {
  // force checked to a boolean again because of react bug
  const {checked, name, onChange, label, value} = props
  return (
    <label className='flex items-center py-2 pl-3 text-[.9375rem] text-fg-primary leading-6'>
      <input
        className='order-2'
        name={name}
        type='radio'
        checked={!!checked}
        value={value}
        onChange={onChange}
      />
      <div className='order-3 pl-2'>{label}</div>
    </label>
  )
}

export default Radio
