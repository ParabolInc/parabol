import ReactSelect from 'react-select'

interface IdName {
  id: string
  name: string
}
export type SelectProps<T extends IdName> = {
  className?: string
  label?: string
  required?: boolean
  options: readonly T[]
  value?: T
  onChange: (value: any) => void
}

const Select = <T extends IdName>(props: SelectProps<T>) => {
  const {label, required, options, value, onChange, className} = props
  return (
    <div className='form-group'>
      {label && (
        <label className='control-label' htmlFor='team'>
          {label}
          {required && <span className='error-text'> *</span>}
        </label>
      )}
      <div className='Input_Wrapper'>
        <ReactSelect
          className={className}
          id='team'
          value={value && {value: value.id, label: value.name}}
          options={options.map(({id, name}) => ({value: id, label: name}))}
          onChange={(newValue) => onChange(options.find(({id}) => id === newValue?.value) ?? null)}
          styles={{menuPortal: (base) => ({...base, zIndex: 9999})}}
          menuPortalTarget={document.body}
          isSearchable={true}
          menuPosition='fixed'
        />
      </div>
    </div>
  )
}

export default Select
