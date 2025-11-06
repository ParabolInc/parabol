import {createFilterOptions, useAutocomplete} from '@mui/base/useAutocomplete'
import CheckIcon from '@mui/icons-material/Check'
import {useMemo} from 'react'
import * as Y from 'yjs'
import {Chip} from '../../../ui/Chip/Chip'
import {cn} from '../../../ui/cn'
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
    ).sort()
  }, [columnValues])

  return options
}

type Option = {
  inputValue?: string
  value: string
}

const filter = createFilterOptions<Option>()

export const TagsCell = ({
  doc,
  rowId,
  columnId
}: {
  doc: Y.Doc
  rowId: RowId
  columnId: ColumnId
}) => {
  const cell = useCell(doc, rowId, columnId)

  const options = useTagsType({doc, columnId}).map((value) => ({value})) as Option[]

  const values = cell
    .toString()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const {
    getRootProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    setAnchorEl
  } = useAutocomplete({
    multiple: true,
    autoSelect: true,
    options,
    value: values,
    freeSolo: true,
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
      // TODO: handle CSV
      for (const value of values) {
        if (typeof value === 'string') {
          normalized.push(value)
        } else {
          normalized.push(value.inputValue || value.value)
        }
      }
      const uniqueNormalized = Array.from(new Set(normalized)).sort()
      cell.delete(0, cell.length)
      cell.insert(0, uniqueNormalized.join(', '))
    },
    filterOptions: (options, params) => {
      const filtered = filter(options, params)

      const {inputValue} = params
      // Suggest the creation of a new value
      const isExisting = options.some((option) => inputValue === option.value)
      if (inputValue !== '' && !isExisting) {
        filtered.push({
          inputValue,
          value: `Add "${inputValue}"`
        })
      }

      return filtered
    }
  })

  return (
    <div>
      <div {...getRootProps()}>
        <div
          ref={setAnchorEl}
          className='flex min-h-[44px] w-full flex-wrap items-center gap-2 p-1 text-sm'
        >
          {values.map((value, index: number) => (
            <Chip
              label={value}
              {...getTagProps({index})}
              key={value}
              className={cn('rounded-lg', getColor(value))}
            />
          ))}
          <input
            {...getInputProps()}
            className='m-0 min-h-[36px] w-0 min-w-[30px] grow border-none pl-1 outline-hidden'
          />
        </div>
      </div>
      {groupedOptions.length > 0 ? (
        <ul
          {...getListboxProps()}
          className='absolute z-50 mt-0.5 h-auto max-h-64 w-[300px] list-none overflow-y-auto rounded-sm bg-white p-0 shadow-card-1'
        >
          {(groupedOptions as Option[]).map((option, index) => (
            <li {...getOptionProps({option, index})} className='group' key={option.value}>
              <span className={'grow'}>{option.value}</span>
              <CheckIcon className='hidden h-5 w-5 group-data[selected]:inline' />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
