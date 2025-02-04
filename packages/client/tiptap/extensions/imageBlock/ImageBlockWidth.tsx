import {memo, useCallback, useEffect, useState} from 'react'

export type ImageBlockWidthProps = {
  onChange: (value: number) => void
  value: number
}

export const ImageBlockWidth = memo(({onChange, value}: ImageBlockWidthProps) => {
  const [currentValue, setCurrentValue] = useState(value)

  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = parseInt(e.target.value)
      onChange(nextValue)
      setCurrentValue(nextValue)
    },
    [onChange]
  )

  return (
    <div className='flex items-center gap-2'>
      <input
        className='bg-neutral-200 fill-neutral-300 h-2 appearance-none rounded-sm border-0'
        type='range'
        min='25'
        max='100'
        step='25'
        onChange={handleChange}
        value={currentValue}
      />
      <span className='text-neutral-500 text-xs font-semibold select-none'>{value}%</span>
    </div>
  )
})

ImageBlockWidth.displayName = 'ImageBlockWidth'
