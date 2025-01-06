import Select from './Select'

export type SimpleSelectProps<T extends string> = {
  label?: string
  required?: boolean
  options: T[]
  value?: T
  onChange: (value: T) => void
}

const SimpleSelect = <T extends string>(props: SimpleSelectProps<T>) => {
  const {label, required, options, value, onChange} = props
  return (
    <Select
      label={label}
      required={required}
      options={options.map((value) => ({id: value, name: value}))}
      value={value && {id: value, name: value}}
      onChange={(newValue) => onChange(newValue?.id ?? null)}
    />
  )
}

export default SimpleSelect
