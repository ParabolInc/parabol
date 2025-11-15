import {createFilterOptions, useAutocomplete} from '@mui/base/useAutocomplete'
import CheckIcon from '@mui/icons-material/Check'
import * as Popover from '@radix-ui/react-popover'
import {useMemo} from 'react'
import * as Y from 'yjs'
import {Chip} from '../../../ui/Chip/Chip'
import {cn} from '../../../ui/cn'
import {Input} from '../../../ui/Input/Input'
import {ColumnId, RowId} from './data'
import {useCell, useColumnValues, useYText} from './hooks'
import {getColor} from './types'

const useStatusType = ({doc, columnId}: {doc: Y.Doc; columnId: ColumnId}) => {
  const columnValues = useColumnValues(doc, columnId)

  const options = useMemo(() => {
    return Array.from(new Set(columnValues.map((s) => s?.toString().trim()).filter(Boolean))).sort()
  }, [columnValues])

  return options as string[]
}

type Option = {
  inputValue?: string
  value: string
}

const filter = createFilterOptions<Option>()

const AutocompleteInput = ({
  value,
  tags,
  setValue
}: {
  value?: string
  setValue: (newValue: string) => void
  tags: string[]
}) => {
  const options = tags.map((tag) => ({value: tag})) as Option[]

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    setAnchorEl
  } = useAutocomplete({
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

  return (
    <Popover.Content
      sideOffset={5}
      className='z-50 max-h-64 w-[300px] overflow-y-auto rounded-sm bg-white p-2 shadow-card-1'
    >
      <div {...getRootProps()}>
        <div
          ref={setAnchorEl}
          className='flex min-h-[44px] w-full flex-wrap items-center gap-2 px-1 py-0.5 text-sm'
        >
          <Input {...getInputProps()} />
        </div>
      </div>
      <ul {...getListboxProps()} className='list-none px-1'>
        {(groupedOptions as Option[]).map((option, index) => (
          <li {...getOptionProps({option, index})} className='group flex p-1' key={option.value}>
            <span className={'grow'}>
              {option.inputValue && 'Add '}
              <Chip
                label={option.value}
                key={option.value}
                className={cn('rounded-lg', getColor(option.value))}
              />
            </span>
            <CheckIcon className='hidden h-5 w-5 group-aria-selected:inline' />
          </li>
        ))}
      </ul>
    </Popover.Content>
  )
}

export const StatusCell = ({
  doc,
  rowId,
  columnId
}: {
  doc: Y.Doc
  rowId: RowId
  columnId: ColumnId
}) => {
  const cell = useCell(doc, rowId, columnId)
  const value = useYText(cell)

  const tags = useStatusType({doc, columnId})

  const setValue = (newValue: string) => {
    cell.delete(0, cell.length)
    cell.insert(0, newValue)
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className='items-cursor-pointer flex h-full w-full cursor-pointer items-center gap-2 p-2 hover:bg-slate-100'>
          {value && (
            <Chip
              label={value}
              key={value}
              className={cn('m-0.5 rounded-lg', !value && 'hidden', getColor(value))}
            />
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <AutocompleteInput value={value} setValue={setValue} tags={tags} />
      </Popover.Portal>
    </Popover.Root>
  )
}
