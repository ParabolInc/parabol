import {createFilterOptions, useAutocomplete} from '@mui/base/useAutocomplete'
import CheckIcon from '@mui/icons-material/Check'
import {useMemo} from 'react'
import * as Y from 'yjs'
import {Chip} from '../../../ui/Chip/Chip'
import {cn} from '../../../ui/cn'
import {ColumnId, RowId} from './data'
import {useCell, useColumnValues} from './hooks'
import {getColor} from './types'

const useStatusType = ({doc, columnId}: {doc: Y.Doc; columnId: ColumnId}) => {
  const columnValues = useColumnValues(doc, columnId)

  const options = useMemo(() => {
    return Array.from(new Set(columnValues.map((s) => s?.toString().trim()).filter(Boolean))).sort()
  }, [columnValues])

  return options
}

type Option = {
  inputValue?: string
  value: string
}

const filter = createFilterOptions<Option>()

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

  const options = useStatusType({doc, columnId}).map((value) => ({value})) as Option[]
  const value = cell.toString()

  const {
    getRootProps,
    getInputProps,
    getClearProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    setAnchorEl
  } = useAutocomplete({
    autoSelect: true,
    options,
    value,
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
    onChange: (_event, value) => {
      let normalized = ''
      if (typeof value === 'string') {
        normalized = value
      } else {
        normalized = value?.inputValue || value?.value || ''
      }
      cell.delete(0, cell.length)
      cell.insert(0, normalized)
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
          className='flex min-h-[44px] w-full flex-wrap items-center gap-2 px-1 py-0.5 text-sm'
        >
          <Chip
            label={value}
            onDelete={getClearProps().onClick}
            key={value}
            className={cn('m-0.5 rounded-lg', !value && 'hidden', getColor(value))}
          />
          <input
            {...getInputProps()}
            className={cn(
              'm-0 min-h-[36px] w-0 min-w-[30px] grow border-none pl-1 outline-hidden',
              value && 'hidden'
            )}
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
