import * as Y from 'yjs'
import {Input} from '../../../ui/Input/Input'
import {useYText} from './hooks'

export const NumberCell = ({text}: {text: Y.Text}) => {
  const rawValue = useYText(text)

  const convertToNumber = (rawValue?: string) => {
    if (!rawValue) return ''
    const conv = parseInt(rawValue, 10)
    if (isNaN(conv)) return ''
    return conv.toString()
  }

  const value = convertToNumber(rawValue)

  return (
    <Input
      type='text'
      value={value}
      className='w-full border-none text-right'
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
