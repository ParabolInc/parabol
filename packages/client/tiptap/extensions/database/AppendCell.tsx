import {HocuspocusProvider} from '@hocuspocus/provider'
import {DeleteOutline} from '@mui/icons-material'
import {deleteRow} from './data'
import {useFocus} from './useFocus'

type Props = {
  provider: HocuspocusProvider
  rowId: string
}

export const AppendCell = (props: Props) => {
  const {provider, rowId} = props
  const {document: doc} = provider

  const {focusProps} = useFocus({
    provider,
    key: `append:${rowId}`
  })

  return (
    <button
      {...focusProps}
      className='group flex h-full w-full cursor-pointer select-none items-center p-2 focus:outline-2 focus:outline-sky-400'
      onClick={() => deleteRow(doc, rowId)}
    >
      <DeleteOutline className='invisible text-slate-600 group-hover:visible group-focus:visible' />
    </button>
  )
}
