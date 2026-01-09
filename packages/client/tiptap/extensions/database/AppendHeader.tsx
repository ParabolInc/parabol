import {HocuspocusProvider} from '@hocuspocus/provider'
import {Add} from '@mui/icons-material'
import {appendColumn} from './data'
import {useFocus} from './useFocus'

type Props = {
  provider: HocuspocusProvider
}

export const AppendHeader = (props: Props) => {
  const {provider} = props
  const {document: doc} = provider

  const {focusProps} = useFocus({
    provider,
    key: 'append'
  })

  return (
    <button
      {...focusProps}
      className='flex h-full w-full cursor-pointer select-none items-center p-2 focus:outline-2 focus:outline-sky-400'
      onClick={() => appendColumn(doc)}
    >
      <Add />
    </button>
  )
}
