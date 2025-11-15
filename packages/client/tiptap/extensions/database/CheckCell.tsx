import * as Y from 'yjs'
import {Input} from '../../../ui/Input/Input'
import {useYText} from './hooks'

export const CheckCell = ({text}: {text: Y.Text}) => {
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
