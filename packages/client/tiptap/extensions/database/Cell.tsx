import * as Y from 'yjs'
import {Input} from '../../../ui/Input/Input'
import {twStyled} from '../../../ui/twStyled'
import {ColumnId, RowId} from './data'
import {useCell, useYText} from './hooks'
import {StatusCell} from './StatusCell'
import {TagsCell} from './TagsCell'
import {DataType} from './types'

const CellInput = twStyled(Input)('w-full border-none')

const TextCell = ({text}: {text: Y.Text}) => {
  const value = useYText(text)
  return (
    <CellInput
      value={value}
      onChange={(e) => {
        // TODO this is wrong
        text.delete(0, text.length)
        text.insert(0, e.target.value)
      }}
    />
  )
}

const NumberCell = ({text}: {text: Y.Text}) => {
  const rawValue = useYText(text)

  const convertToNumber = (rawValue?: string) => {
    if (!rawValue) return ''
    const conv = parseInt(rawValue, 10)
    if (isNaN(conv)) return ''
    return conv.toString()
  }

  const value = convertToNumber(rawValue)

  return (
    <CellInput
      type='text'
      value={value}
      className='text-right'
      onChange={(e) => {
        const rawValue = e.target.value
        const value = convertToNumber(rawValue)
        text.delete(0, text.length)
        if (value) {
          text.insert(0, value)
        }
      }}
    />
  )
}

const CheckCell = ({text}: {text: Y.Text}) => {
  const value = useYText(text)
  const checked = value === 'true'
  return (
    <Input
      type='checkbox'
      checked={checked}
      className='mx-2.5 h-4.5 w-4.5 border-none'
      onChange={(e) => {
        text.delete(0, text.length)
        text.insert(0, e.target.checked ? 'true' : 'false')
      }}
    />
  )
}

export const Cell = (props: {type: DataType; doc: Y.Doc; rowId: RowId; columnId: ColumnId}) => {
  const {type, doc, rowId, columnId} = props

  const text = useCell(doc, rowId, columnId)

  switch (type) {
    case 'number':
      return <NumberCell text={text} />
    case 'check':
      return <CheckCell text={text} />
    case 'status':
      return <StatusCell doc={doc} rowId={rowId} columnId={columnId} />
    case 'tags':
      return <TagsCell doc={doc} rowId={rowId} columnId={columnId} />
    default:
      return <TextCell text={text} />
  }
}
