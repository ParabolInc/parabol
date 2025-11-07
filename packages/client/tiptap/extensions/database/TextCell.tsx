import * as Y from 'yjs'
import {Input} from '../../../ui/Input/Input'
import {useYText} from './hooks'

export const TextCell = ({text}: {text: Y.Text}) => {
  const value = useYText(text)
  return (
    <Input
      value={value}
      className='w-full border-none'
      onChange={(e) => {
        // TODO this is wrong
        text.delete(0, text.length)
        text.insert(0, e.target.value)
      }}
    />
  )
}
