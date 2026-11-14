import {createFilterOptions, useAutocomplete} from '@mui/base/useAutocomplete'
import {type TagOption, TagPickerPanel} from './TagPickerPanel'

const filter = createFilterOptions<TagOption>()

type Props = {
  value: string | null
  setValue: (newValue: string) => void
  tags: string[]
}

export const StatusPicker = (props: Props) => {
  const {value, tags, setValue} = props
  const options = tags.map((tag) => ({value: tag})) as TagOption[]

  const autocomplete = useAutocomplete({
    open: true,
    options,
    value,
    //disableCloseOnSelect: true,
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
    onChange: (_event, value) => {
      let normalized = ''
      if (typeof value === 'string') {
        normalized = value
      } else {
        normalized = value?.inputValue || value?.value || ''
      }
      if (normalized) {
        setValue(normalized)
      }
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
