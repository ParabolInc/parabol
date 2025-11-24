import {createFilterOptions, useAutocomplete} from '@mui/base/useAutocomplete'
import CheckIcon from '@mui/icons-material/Check'
import * as Popover from '@radix-ui/react-popover'
import {useMemo} from 'react'
import * as Y from 'yjs'
import {Chip} from '../../../ui/Chip/Chip'
import {cn} from '../../../ui/cn'
import {Input} from '../../../ui/Input/Input'
import {ColumnId, RowId} from './data'
import {useCell, useColumnValues} from './hooks'
import {getColor} from './types'

const useTagsType = ({doc, columnId}: {doc: Y.Doc; columnId: ColumnId}) => {
  const columnValues = useColumnValues(doc, columnId)

  const options = useMemo(() => {
    return Array.from(
      new Set(
        columnValues.flatMap((value) => value?.split(',').map((s) => s.trim())).filter(Boolean)
      )
    ).sort() as string[]
  }, [columnValues])

  return options
}

type Option = {
  inputValue?: string
  value: string
}

const filter = createFilterOptions<Option>()

const AutocompleteInput = ({
  values,
  tags,
  setValues
}: {
  values: string[]
  setValues: (newValues: string[]) => void
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
    multiple: true,
    autoSelect: true,
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

export const TagsCell = ({
  doc,
  rowId,
  columnId,
  userId
}: {
  doc: Y.Doc
  rowId: RowId
  columnId: ColumnId
  userId?: string
}) => {
  const [rawValue, setRawValue] = useCell(doc, rowId, columnId, userId)

  const tags = useTagsType({doc, columnId})

  const values =
    rawValue
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? []

  const setValues = (newValues: string[]) => {
    setRawValue(newValues.join(', '))
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className='items-cursor-pointer flex h-full w-full cursor-pointer items-center gap-2 p-2 hover:bg-slate-100'>
          {values.map((value) => (
            <Chip key={value} label={value} className={cn('m-0.5 rounded-lg', getColor(value))} />
          ))}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <AutocompleteInput values={values} setValues={setValues} tags={tags} />
      </Popover.Portal>
    </Popover.Root>
  )
}
