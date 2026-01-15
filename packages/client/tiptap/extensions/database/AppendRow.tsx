import {HocuspocusProvider} from '@hocuspocus/provider'
import {Add} from '@mui/icons-material'
import PlainButton from '../../../components/PlainButton/PlainButton'
import {appendRow} from './data'
import {useFocus, useFocusedCell} from './useFocus'

type Props = {
  provider: HocuspocusProvider
  userId?: string
}

export const AppendRow = (props: Props) => {
  const {provider, userId} = props
  const {document: doc} = provider

  const focusedCell = useFocusedCell(provider)
  const column = focusedCell?.split(':')[0] ?? 'append'
  const {focusProps} = useFocus({provider, key: `${column}:append`})

  return (
    <PlainButton
      {...focusProps}
      className='h-full w-full cursor-pointer hover:bg-slate-100 focus:outline-2 focus:outline-sky-400'
      onClick={() => appendRow(doc, userId)}
    >
      <div className='sticky left-0 flex w-fit items-center gap-2 p-2'>
        <Add />
        New entry
      </div>
    </PlainButton>
  )
}
