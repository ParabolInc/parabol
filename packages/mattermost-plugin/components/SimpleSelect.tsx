import Select from './Select'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export type SimpleSelectProps<T extends string> = {
  label?: string
  required?: boolean
  options: T[]
  value?: T
  onChange: (value: T) => void
  className?: string
}

const SimpleSelect = <T extends string>(props: SimpleSelectProps<T>) => {
  const {label, required, options, value, onChange, className} = props
  return (
    <Select
      className={className}
      label={label}
      required={required}
      options={options.map((value) => ({id: value, name: capitalize(value)}))}
      value={value && {id: value, name: capitalize(value)}}
      onChange={(newValue) => onChange(newValue?.id ?? null)}
    />
  )
}

export default SimpleSelect
