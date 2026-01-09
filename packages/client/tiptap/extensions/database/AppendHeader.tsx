import {HocuspocusProvider} from '@hocuspocus/provider'
import {Add} from '@mui/icons-material'
import {useRef} from 'react'
import {appendColumn} from './data'
import {useFocus} from './useFocus'

type Props = {
  provider: HocuspocusProvider
}

export const AppendHeader = (props: Props) => {
  const {provider} = props
  const {document: doc} = provider

  const ref = useRef<HTMLDivElement>(null)
  const {isFocused} = useFocus({provider, key: 'append'})

  return (
    <div
      ref={ref}
      tabIndex={isFocused ? 0 : -1}
      className='flex w-full cursor-pointer items-center border-none p-2 hover:bg-slate-100 focus:ring-1 focus:ring-sky-400'
      onClick={() => appendColumn(doc)}
    >
      <Add />
    </div>
  )
}
