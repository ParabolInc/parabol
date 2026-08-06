import type {CSSProperties} from 'react'
import {cn} from '../../ui/cn'

const inlineStyles = {
  small: 'py-1.5 leading-5',
  medium: 'py-2 leading-6',
  large: 'py-3 leading-7'
} as const

const indentStyles = {
  small: 'pl-2',
  medium: 'pl-3',
  large: 'pl-4'
} as const

interface Props {
  customStyles?: CSSProperties
  fieldSize: string
  htmlFor?: string
  indent: boolean
  inline?: boolean
  label: string
}

const FieldLabel = (props: Props) => {
  const {customStyles, fieldSize, indent, inline, htmlFor, label} = props
  const size = (fieldSize || 'medium') as 'small' | 'medium' | 'large'
  return (
    <label
      className={cn(
        'block select-none p-0 font-semibold text-fg-secondary text-xs normal-case tracking-[.03em]',
        fieldSize && inline && inlineStyles[size],
        fieldSize && indent && indentStyles[size]
      )}
      htmlFor={htmlFor}
      style={customStyles}
    >
      {label}
    </label>
  )
}

export default FieldLabel
