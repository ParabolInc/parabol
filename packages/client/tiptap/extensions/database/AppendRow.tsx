import {HocuspocusProvider} from '@hocuspocus/provider'
import {Add} from '~/ui/icons'
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
    <button
      {...focusProps}
      type='button'
      className='-outline-offset-2 block h-full w-full cursor-pointer select-none text-left text-fg-secondary outline-accent hover:bg-surface-hover focus-visible:outline-2'
      onClick={() => appendRow(doc, userId)}
    >
      <div className='sticky left-0 flex w-fit items-center gap-1.5 px-3'>
        <Add className='text-[16px] text-fg-muted' />
        New entry
      </div>
    </button>
  )
}
