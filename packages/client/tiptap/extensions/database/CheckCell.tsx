import {HocuspocusProvider} from '@hocuspocus/provider'
import {Checkbox} from '../../../ui/Checkbox/Checkbox'
import {cn} from '../../../ui/cn'
import {cellClassName} from './cellClassName'
import {ColumnId, RowId} from './data'
import {useCell} from './hooks'
import {useFocus} from './useFocus'

export const CheckCell = ({
  provider,
  rowId,
  columnId
}: {
  provider: HocuspocusProvider
  rowId: RowId
  columnId: ColumnId
}) => {
  const {document: doc} = provider
  const [rawValue, setRawValue] = useCell(doc, rowId, columnId)

  const checked = rawValue === 'true'
  const toggleValue = () => {
    setRawValue(checked ? 'false' : 'true')
  }

  const {focusProps} = useFocus({
    provider,
    key: `${columnId}:${rowId}`,
    onStartEditing: () => {
      toggleValue()
    }
  })

  return (
    <div
      {...focusProps}
      className={cn(cellClassName, 'cursor-pointer justify-center')}
      onClick={toggleValue}
    >
      <Checkbox checked={checked} />
    </div>
  )
}
