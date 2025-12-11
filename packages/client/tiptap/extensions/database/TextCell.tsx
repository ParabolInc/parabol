import {HocuspocusProvider} from '@hocuspocus/provider'
import {useRef} from 'react'
import {Input} from '../../../ui/Input/Input'
import {ColumnId, RowId} from './data'
import {useCell} from './hooks'
import {useFocus} from './useFocus'

export const TextCell = ({
  provider,
  rowId,
  columnId
}: {
  provider: HocuspocusProvider
  rowId: RowId
  columnId: ColumnId
}) => {
  const {document: doc} = provider
  const [value, setValue] = useCell(doc, rowId, columnId)
  const ref = useRef<HTMLInputElement>(null)
  useFocus(provider, `${columnId}:${rowId}`, ref.current)

  return (
    <Input
      value={value ?? ''}
      className='w-full border-none focus:ring-1 focus:ring-sky-400'
      onChange={(e) => {
        setValue(e.target.value || null)
      }}
      ref={ref}
    />
  )
}
