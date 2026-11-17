import {createFilterOptions, useAutocomplete} from '@mui/base/useAutocomplete'
import {type TagOption, TagPickerPanel} from './TagPickerPanel'

const filter = createFilterOptions<TagOption>()

type Props = {
  values: string[]
  setValues: (newValues: string[]) => void
  tags: string[]
}

export const TagsPicker = (props: Props) => {
  const {values, tags, setValues} = props
  const options = tags.map((tag) => ({value: tag})) as TagOption[]

  const autocomplete = useAutocomplete({
    open: true,
    multiple: true,
    options,
    value: values,
    freeSolo: true,
    isOptionEqualToValue: (option, value) => {
      const a = typeof option === 'string' ? option : option.value
      const b = typeof value === 'string' ? value : value.value
      return a === b
    },
    getOptionLabel: (option) => {
      if (typeof option === 'string') {
        return option
      }
      if (option.inputValue) {
        return option.inputValue
      }
      return option.value
    },
    onChange: (_event, values) => {
      const normalized = [] as string[]
      for (const value of values) {
        if (typeof value === 'string') {
          normalized.push(value)
        } else {
          normalized.push(value.inputValue || value.value)
        }
      }
      const uniqueNormalized = Array.from(new Set(normalized)).sort()
      setValues(uniqueNormalized)
    },
    filterOptions: (options, params) => {
      const filtered = filter(options, params)

      const {inputValue} = params
      // Suggest the creation of a new value
      const isExisting = options.some((option) => inputValue === option.value)
      if (inputValue !== '' && !isExisting) {
        filtered.push({
          inputValue,
          value: inputValue
        })
      }

      return filtered
    }
  })

  return <TagPickerPanel {...autocomplete} />
}
