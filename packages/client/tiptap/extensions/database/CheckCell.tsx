import {HocuspocusProvider} from '@hocuspocus/provider'
import {Checkbox} from '../../../ui/Checkbox/Checkbox'
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

  const checked = rawValue === 'true' ? true : rawValue === 'false' ? false : 'indeterminate'
  const toggleValue = () => {
    if (checked) {
      setRawValue('false')
    } else {
      setRawValue('true')
    }
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
      className='flex h-full w-full cursor-pointer items-center justify-center focus:outline-2 focus:outline-sky-400'
      onClick={toggleValue}
    >
      <Checkbox checked={checked} />
    </div>
  )
}
